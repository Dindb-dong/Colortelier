import { supabase, BUCKETS } from '../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../middleware/upload.js';
import { validateRequired, sanitizeString } from '../utils/validation.js';

export const createFilter = async (req, res) => {
  try {
    const { name, description } = req.body;
    const beforeImageFile = req.files?.before_image?.[0];
    const afterImageFile = req.files?.after_image?.[0];
    const xmpFile = req.files?.xmp_file?.[0];

    // Validation
    validateRequired(name, 'Name');

    if (!beforeImageFile || !afterImageFile) {
      return res.status(400).json({ error: 'Before and after images are required' });
    }

    if (!xmpFile) {
      return res.status(400).json({ error: 'XMP file is required' });
    }

    // Upload files to Supabase Storage
    const [beforeUpload, afterUpload, xmpUpload] = await Promise.all([
      uploadToSupabase(beforeImageFile, BUCKETS.FILTERS, 'before'),
      uploadToSupabase(afterImageFile, BUCKETS.FILTERS, 'after'),
      uploadToSupabase(xmpFile, BUCKETS.FILTERS, 'xmp')
    ]);

    // Create filter
    const { data: filter, error } = await supabase
      .from('filters')
      .insert({
        name: sanitizeString(name, 100),
        description: description ? sanitizeString(description) : null,
        before_image_url: beforeUpload.url,
        after_image_url: afterUpload.url,
        xmp_file_url: xmpUpload.url,
        created_by: req.user.id
      })
      .select('*')
      .single();

    if (error) {
      // If database insert fails, clean up uploaded files
      await Promise.all([
        deleteFromSupabase(BUCKETS.FILTERS, beforeUpload.path),
        deleteFromSupabase(BUCKETS.FILTERS, afterUpload.path),
        deleteFromSupabase(BUCKETS.FILTERS, xmpUpload.path)
      ]);
      console.error('Create filter error:', error);
      return res.status(500).json({ error: 'Failed to create filter' });
    }

    res.status(201).json({
      message: 'Filter created successfully',
      filter
    });
  } catch (error) {
    console.error('Create filter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFilters = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = 'created_at', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('filters')
      .select(`
        *,
        created_by_user:users!filters_created_by_fkey(username)
      `, { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    const validSortFields = ['created_at', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: filters, error, count } = await query;

    if (error) {
      console.error('Get filters error:', error);
      return res.status(500).json({ error: 'Failed to fetch filters' });
    }

    // Get likes count for all filters
    if (filters && filters.length > 0) {
      const filterIds = filters.map(f => f.id);
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('item_id')
        .eq('item_type', 'f')
        .in('item_id', filterIds);

      if (!likesError && likesData) {
        // Count likes per filter
        const likesCountMap = {};
        likesData.forEach(like => {
          likesCountMap[like.item_id] = (likesCountMap[like.item_id] || 0) + 1;
        });

        // Add likes_count to each filter
        filters.forEach(filter => {
          filter.likes_count = likesCountMap[filter.id] || 0;
        });
      }
    }

    res.json({
      filters: filters || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFilterById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: filter, error } = await supabase
      .from('filters')
      .select(`
        *,
        created_by_user:users!filters_created_by_fkey(username)
      `)
      .eq('id', id)
      .single();

    if (error || !filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    // Get likes count
    const { count, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', 'f')
      .eq('item_id', id);

    if (!likesError) {
      filter.likes_count = count || 0;
    } else {
      filter.likes_count = 0;
    }

    res.json({ filter });
  } catch (error) {
    console.error('Get filter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const beforeImageFile = req.files?.before_image?.[0];
    const afterImageFile = req.files?.after_image?.[0];
    const xmpFile = req.files?.xmp_file?.[0];

    // Check if filter exists and user owns it
    const { data: existingFilter } = await supabase
      .from('filters')
      .select('created_by, before_image_url, after_image_url, xmp_file_url')
      .eq('id', id)
      .single();

    if (!existingFilter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    if (existingFilter.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this filter' });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = sanitizeString(name, 100);
    }
    if (description !== undefined) {
      updates.description = sanitizeString(description);
    }

    // Handle file updates
    const filesToDelete = [];
    
    if (beforeImageFile) {
      const uploadResult = await uploadToSupabase(beforeImageFile, BUCKETS.FILTERS, 'before');
      updates.before_image_url = uploadResult.url;
      filesToDelete.push(`before/${existingFilter.before_image_url.split('/').pop()}`);
    }
    
    if (afterImageFile) {
      const uploadResult = await uploadToSupabase(afterImageFile, BUCKETS.FILTERS, 'after');
      updates.after_image_url = uploadResult.url;
      filesToDelete.push(`after/${existingFilter.after_image_url.split('/').pop()}`);
    }
    
    if (xmpFile) {
      const uploadResult = await uploadToSupabase(xmpFile, BUCKETS.FILTERS, 'xmp');
      updates.xmp_file_url = uploadResult.url;
      filesToDelete.push(`xmp/${existingFilter.xmp_file_url.split('/').pop()}`);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: filter, error } = await supabase
      .from('filters')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update filter error:', error);
      return res.status(500).json({ error: 'Failed to update filter' });
    }

    // Delete old files
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map(path => deleteFromSupabase(BUCKETS.FILTERS, path)));
    }

    res.json({
      message: 'Filter updated successfully',
      filter
    });
  } catch (error) {
    console.error('Update filter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFilter = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if filter exists and user owns it
    const { data: existingFilter } = await supabase
      .from('filters')
      .select('created_by, before_image_url, after_image_url, xmp_file_url')
      .eq('id', id)
      .single();

    if (!existingFilter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    if (existingFilter.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this filter' });
    }

    // Delete files from storage
    const filesToDelete = [
      `before/${existingFilter.before_image_url.split('/').pop()}`,
      `after/${existingFilter.after_image_url.split('/').pop()}`,
      `xmp/${existingFilter.xmp_file_url.split('/').pop()}`
    ];

    await Promise.all(filesToDelete.map(path => deleteFromSupabase(BUCKETS.FILTERS, path)));

    // Delete filter from database
    const { error } = await supabase
      .from('filters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete filter error:', error);
      return res.status(500).json({ error: 'Failed to delete filter' });
    }

    res.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Delete filter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
