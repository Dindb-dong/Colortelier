import { supabase } from '../config/supabase.js';
import { validateRequired, validateUUID } from '../utils/validation.js';

export const toggleColorLike = async (req, res) => {
  try {
    const { colorCodeId } = req.params;

    if (!validateUUID(colorCodeId)) {
      return res.status(400).json({ error: 'Invalid color code ID' });
    }

    // Check if color code exists
    const { data: colorCode } = await supabase
      .from('color_codes')
      .select('id')
      .eq('id', colorCodeId)
      .single();

    if (!colorCode) {
      return res.status(404).json({ error: 'Color code not found' });
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_type', 'c')
      .eq('item_id', colorCodeId)
      .single();

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Remove like error:', error);
        return res.status(500).json({ error: 'Failed to remove like' });
      }

      res.json({ 
        message: 'Like removed',
        liked: false 
      });
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: req.user.id,
          item_type: 'c',
          item_id: colorCodeId
        });

      if (error) {
        console.error('Add like error:', error);
        return res.status(500).json({ error: 'Failed to add like' });
      }

      res.json({ 
        message: 'Like added',
        liked: true 
      });
    }
  } catch (error) {
    console.error('Toggle color like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleFilterLike = async (req, res) => {
  try {
    const { filterId } = req.params;

    if (!validateUUID(filterId)) {
      return res.status(400).json({ error: 'Invalid filter ID' });
    }

    // Check if filter exists
    const { data: filter } = await supabase
      .from('filters')
      .select('id')
      .eq('id', filterId)
      .single();

    if (!filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_type', 'f')
      .eq('item_id', filterId)
      .single();

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Remove like error:', error);
        return res.status(500).json({ error: 'Failed to remove like' });
      }

      res.json({ 
        message: 'Like removed',
        liked: false 
      });
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: req.user.id,
          item_type: 'f',
          item_id: filterId
        });

      if (error) {
        console.error('Add like error:', error);
        return res.status(500).json({ error: 'Failed to add like' });
      }

      res.json({ 
        message: 'Like added',
        liked: true 
      });
    }
  } catch (error) {
    console.error('Toggle filter like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserLikes = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Build base query for likes
    let likesQuery = supabase
      .from('likes')
      .select('*')
      .eq('user_id', req.user.id);

    let countQuery = supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // Filter by type if specified
    if (type === 'color_codes') {
      likesQuery = likesQuery.eq('item_type', 'c');
      countQuery = countQuery.eq('item_type', 'c');
    } else if (type === 'filters') {
      likesQuery = likesQuery.eq('item_type', 'f');
      countQuery = countQuery.eq('item_type', 'f');
    }

    // Get total count
    const { count: totalCount } = await countQuery;

    // Apply pagination and ordering
    likesQuery = likesQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: likes, error: likesError } = await likesQuery;

    if (likesError) {
      console.error('Get user likes error:', likesError);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }

    if (!likes || likes.length === 0) {
      return res.json({
        likes: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      });
    }

    // Fetch related items separately
    const colorCodeIds = likes.filter(l => l.item_type === 'c').map(l => l.item_id);
    const filterIds = likes.filter(l => l.item_type === 'f').map(l => l.item_id);

    const likesWithData = [];

    // Fetch color codes if needed
    if (colorCodeIds.length > 0 && (type === 'color_codes' || !type)) {
      const { data: colorCodes, error: colorError } = await supabase
        .from('color_codes')
        .select(`
          *,
          created_by_user:users!color_codes_created_by_fkey(username)
        `)
        .in('id', colorCodeIds);

      if (!colorError && colorCodes) {
        const colorCodesMap = new Map(colorCodes.map(c => [c.id, c]));
        likes.forEach(like => {
          if (like.item_type === 'c' && colorCodesMap.has(like.item_id)) {
            likesWithData.push({
              ...like,
              color_codes: colorCodesMap.get(like.item_id)
            });
          }
        });
      }
    }

    // Fetch filters if needed
    if (filterIds.length > 0 && (type === 'filters' || !type)) {
      const { data: filters, error: filterError } = await supabase
        .from('filters')
        .select(`
          *,
          created_by_user:users!filters_created_by_fkey(username)
        `)
        .in('id', filterIds);

      if (!filterError && filters) {
        const filtersMap = new Map(filters.map(f => [f.id, f]));
        likes.forEach(like => {
          if (like.item_type === 'f' && filtersMap.has(like.item_id)) {
            likesWithData.push({
              ...like,
              filters: filtersMap.get(like.item_id)
            });
          }
        });
      }
    }

    // If type is specified, return only that type. Otherwise merge both.
    let resultLikes;
    if (type === 'color_codes') {
      resultLikes = likesWithData.filter(l => l.item_type === 'c');
    } else if (type === 'filters') {
      resultLikes = likesWithData.filter(l => l.item_type === 'f');
    } else {
      // Merge both types, maintaining order
      resultLikes = likes.map(like => {
        const withData = likesWithData.find(l => l.id === like.id);
        return withData || like;
      });
    }

    res.json({
      likes: resultLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkLikeStatus = async (req, res) => {
  try {
    const { type, id } = req.query;

    if (!type || !id) {
      return res.status(400).json({ error: 'Type and ID are required' });
    }

    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    let itemType;
    if (type === 'color_code') {
      itemType = 'c';
    } else if (type === 'filter') {
      itemType = 'f';
    } else {
      return res.status(400).json({ error: 'Type must be either color_code or filter' });
    }

    const { data: like, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_type', itemType)
      .eq('item_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Check like status error:', error);
      return res.status(500).json({ error: 'Failed to check like status' });
    }

    res.json({ 
      liked: !!like,
      likeId: like?.id || null
    });
  } catch (error) {
    console.error('Check like status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
