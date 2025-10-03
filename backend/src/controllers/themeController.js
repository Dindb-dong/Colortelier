import { supabase, BUCKETS } from '../config/supabase.js';
import { uploadToSupabase, deleteFromSupabase } from '../middleware/upload.js';
import { validateRequired, sanitizeString } from '../utils/validation.js';

export const createTheme = async (req, res) => {
  try {
    const { name, description, theme_code } = req.body;
    const thumbnailFile = req.file;

    // Validation
    validateRequired(name, 'Name');
    validateRequired(theme_code, 'Theme code');

    if (!thumbnailFile) {
      return res.status(400).json({ error: 'Thumbnail image is required' });
    }

    // Upload thumbnail to Supabase Storage
    const uploadResult = await uploadToSupabase(thumbnailFile, BUCKETS.THEMES, 'thumbnails');

    // Create theme
    const { data: theme, error } = await supabase
      .from('themes')
      .insert({
        name: sanitizeString(name, 100),
        description: description ? sanitizeString(description) : null,
        thumbnail_url: uploadResult.url,
        theme_code: theme_code,
        created_by: req.user.id
      })
      .select('*')
      .single();

    if (error) {
      // If database insert fails, clean up uploaded file
      await deleteFromSupabase(BUCKETS.THEMES, uploadResult.path);
      console.error('Create theme error:', error);
      return res.status(500).json({ error: 'Failed to create theme' });
    }

    res.status(201).json({
      message: 'Theme created successfully',
      theme
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getThemes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = 'created_at', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('themes')
      .select(`
        *,
        created_by_user:users!themes_created_by_fkey(username)
      `);

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

    const { data: themes, error, count } = await query;

    if (error) {
      console.error('Get themes error:', error);
      return res.status(500).json({ error: 'Failed to fetch themes' });
    }

    res.json({
      themes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getThemeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: theme, error } = await supabase
      .from('themes')
      .select(`
        *,
        created_by_user:users!themes_created_by_fkey(username)
      `)
      .eq('id', id)
      .single();

    if (error || !theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json({ theme });
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, theme_code } = req.body;
    const thumbnailFile = req.file;

    // Check if theme exists and user owns it
    const { data: existingTheme } = await supabase
      .from('themes')
      .select('created_by, thumbnail_url')
      .eq('id', id)
      .single();

    if (!existingTheme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    if (existingTheme.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this theme' });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = sanitizeString(name, 100);
    }
    if (description !== undefined) {
      updates.description = sanitizeString(description);
    }
    if (theme_code !== undefined) {
      updates.theme_code = theme_code;
    }

    // Handle thumbnail update
    if (thumbnailFile) {
      const uploadResult = await uploadToSupabase(thumbnailFile, BUCKETS.THEMES, 'thumbnails');
      updates.thumbnail_url = uploadResult.url;
      
      // Delete old thumbnail
      const oldPath = existingTheme.thumbnail_url.split('/').pop();
      await deleteFromSupabase(BUCKETS.THEMES, `thumbnails/${oldPath}`);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: theme, error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update theme error:', error);
      return res.status(500).json({ error: 'Failed to update theme' });
    }

    res.json({
      message: 'Theme updated successfully',
      theme
    });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if theme exists and user owns it
    const { data: existingTheme } = await supabase
      .from('themes')
      .select('created_by, thumbnail_url')
      .eq('id', id)
      .single();

    if (!existingTheme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    if (existingTheme.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this theme' });
    }

    // Delete thumbnail from storage
    const thumbnailPath = existingTheme.thumbnail_url.split('/').pop();
    await deleteFromSupabase(BUCKETS.THEMES, `thumbnails/${thumbnailPath}`);

    // Delete theme from database
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete theme error:', error);
      return res.status(500).json({ error: 'Failed to delete theme' });
    }

    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
