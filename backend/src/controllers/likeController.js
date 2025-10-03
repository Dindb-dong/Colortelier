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
      .eq('color_code_id', colorCodeId)
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
          color_code_id: colorCodeId
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
      .eq('filter_id', filterId)
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
          filter_id: filterId
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

    let query;
    let selectFields;

    if (type === 'color_codes') {
      query = supabase
        .from('likes')
        .select(`
          color_codes!inner(
            *,
            created_by_user:users!color_codes_created_by_fkey(username)
          )
        `)
        .eq('user_id', req.user.id)
        .not('color_code_id', 'is', null);
    } else if (type === 'filters') {
      query = supabase
        .from('likes')
        .select(`
          filters!inner(
            *,
            created_by_user:users!filters_created_by_fkey(username)
          )
        `)
        .eq('user_id', req.user.id)
        .not('filter_id', 'is', null);
    } else {
      return res.status(400).json({ error: 'Type must be either color_codes or filters' });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: likes, error, count } = await query;

    if (error) {
      console.error('Get user likes error:', error);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }

    res.json({
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
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

    let query;
    if (type === 'color_code') {
      query = supabase
        .from('likes')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('color_code_id', id)
        .single();
    } else if (type === 'filter') {
      query = supabase
        .from('likes')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('filter_id', id)
        .single();
    } else {
      return res.status(400).json({ error: 'Type must be either color_code or filter' });
    }

    const { data: like, error } = await query;

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
