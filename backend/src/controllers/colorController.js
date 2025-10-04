import { supabase } from '../config/supabase.js';
import { validateRequired, validateHexColor, validateRGB, validateHSL, validateCMYK, sanitizeString } from '../utils/validation.js';

export const createColorCode = async (req, res) => {
  try {
    const { 
      color_code, 
      hex_code, 
      rgb_r, 
      rgb_g, 
      rgb_b, 
      cmyk_c, 
      cmyk_m, 
      cmyk_y, 
      cmyk_k, 
      hsl_h, 
      hsl_s, 
      hsl_l, 
      name, 
      description 
    } = req.body;

    // Validation
    validateRequired(color_code, 'Color code');
    validateRequired(hex_code, 'Hex code');
    validateRequired(rgb_r, 'RGB R');
    validateRequired(rgb_g, 'RGB G');
    validateRequired(rgb_b, 'RGB B');

    if (!validateHexColor(hex_code)) {
      return res.status(400).json({ error: 'Invalid hex color format' });
    }

    if (!validateRGB(rgb_r, rgb_g, rgb_b)) {
      return res.status(400).json({ error: 'Invalid RGB values (0-255)' });
    }

    if (hsl_h !== undefined && !validateHSL(hsl_h, hsl_s || 0, hsl_l || 0)) {
      return res.status(400).json({ error: 'Invalid HSL values' });
    }

    // Validate CMYK values (0-100)
    if (cmyk_c !== undefined || cmyk_m !== undefined || cmyk_y !== undefined || cmyk_k !== undefined) {
      if (!validateCMYK(cmyk_c || 0, cmyk_m || 0, cmyk_y || 0, cmyk_k || 0)) {
        return res.status(400).json({ error: 'CMYK values must be between 0-100' });
      }
    }

    // Check if color code already exists
    const { data: existingColor } = await supabase
      .from('color_codes')
      .select('id')
      .eq('color_code', color_code)
      .single();

    if (existingColor) {
      return res.status(409).json({ error: 'Color code already exists' });
    }

    // Create color code
    const { data: colorCode, error } = await supabase
      .from('color_codes')
      .insert({
        color_code: sanitizeString(color_code, 50),
        hex_code: hex_code.toUpperCase(),
        rgb_r: parseInt(rgb_r),
        rgb_g: parseInt(rgb_g),
        rgb_b: parseInt(rgb_b),
        cmyk_c: cmyk_c ? parseFloat(cmyk_c) : null,
        cmyk_m: cmyk_m ? parseFloat(cmyk_m) : null,
        cmyk_y: cmyk_y ? parseFloat(cmyk_y) : null,
        cmyk_k: cmyk_k ? parseFloat(cmyk_k) : null,
        hsl_h: hsl_h ? parseInt(hsl_h) : null,
        hsl_s: hsl_s ? parseInt(hsl_s) : null,
        hsl_l: hsl_l ? parseInt(hsl_l) : null,
        name: name ? sanitizeString(name, 100) : null,
        description: description ? sanitizeString(description) : null,
        created_by: req.user.id
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create color code error:', error);
      return res.status(500).json({ error: 'Failed to create color code' });
    }

    res.status(201).json({
      message: 'Color code created successfully',
      colorCode
    });
  } catch (error) {
    console.error('Create color code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getColorCodes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = 'created_at', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('color_codes')
      .select(`
        *,
        created_by_user:users!color_codes_created_by_fkey(username),
        likes_count:likes(count)
      `);

    // Search filter
    if (search) {
      query = query.or(`color_code.ilike.%${search}%,hex_code.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Sorting
    const validSortFields = ['created_at', 'color_code', 'hex_code', 'name'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: colorCodes, error, count } = await query;

    if (error) {
      console.error('Get color codes error:', error);
      return res.status(500).json({ error: 'Failed to fetch color codes' });
    }

    res.json({
      colorCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get color codes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getColorCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: colorCode, error } = await supabase
      .from('color_codes')
      .select(`
        *,
        created_by_user:users!color_codes_created_by_fkey(username),
        likes_count:likes(count)
      `)
      .eq('id', id)
      .single();

    if (error || !colorCode) {
      return res.status(404).json({ error: 'Color code not found' });
    }

    res.json({ colorCode });
  } catch (error) {
    console.error('Get color code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateColorCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if color code exists and user owns it
    const { data: existingColor } = await supabase
      .from('color_codes')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existingColor) {
      return res.status(404).json({ error: 'Color code not found' });
    }

    if (existingColor.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this color code' });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = sanitizeString(name, 100);
    }
    if (description !== undefined) {
      updates.description = sanitizeString(description);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: colorCode, error } = await supabase
      .from('color_codes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update color code error:', error);
      return res.status(500).json({ error: 'Failed to update color code' });
    }

    res.json({
      message: 'Color code updated successfully',
      colorCode
    });
  } catch (error) {
    console.error('Update color code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteColorCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if color code exists and user owns it
    const { data: existingColor } = await supabase
      .from('color_codes')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!existingColor) {
      return res.status(404).json({ error: 'Color code not found' });
    }

    if (existingColor.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this color code' });
    }

    const { error } = await supabase
      .from('color_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete color code error:', error);
      return res.status(500).json({ error: 'Failed to delete color code' });
    }

    res.json({ message: 'Color code deleted successfully' });
  } catch (error) {
    console.error('Delete color code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
