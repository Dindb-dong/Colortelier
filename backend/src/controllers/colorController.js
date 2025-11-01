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

    // 컬러 코드의 필수 부분만 추출 (L-KR-SEL-HNGD-CL-GD-SK -> L-KR-SEL-HNGD-CL-GD)
    const getBaseColorCode = (code) => {
      const parts = code.split('-');
      // 필수 부분은 앞 6개 (domain, country, city, detail, weather, time)
      return parts.slice(0, 6).join('-');
    };

    const baseColorCode = getBaseColorCode(color_code);
    const normalizedHex = hex_code.toUpperCase();

    // 1. hex값이 겹치는지 확인
    const { data: existingColorsWithSameHex } = await supabase
      .from('color_codes')
      .select('id, color_code')
      .eq('hex_code', normalizedHex);

    if (existingColorsWithSameHex && existingColorsWithSameHex.length > 0) {
      // 2. 같은 hex값이 있으면, 같은 필수 컬러 코드를 가지는지 확인
      const hasSameBaseCode = existingColorsWithSameHex.some(existing => {
        const existingBaseCode = getBaseColorCode(existing.color_code);
        return existingBaseCode === baseColorCode;
      });

      if (hasSameBaseCode) {
        return res.status(409).json({ 
          error: 'This hex color already exists with the same theme code (base color code)' 
        });
      }
      // 다른 필수 컬러 코드면 등록 가능 (통과)
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
        created_by_user:users!color_codes_created_by_fkey(username)
      `, { count: 'exact' });

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

    // Get likes count for all color codes
    if (colorCodes && colorCodes.length > 0) {
      const colorIds = colorCodes.map(c => c.id);
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('item_id')
        .eq('item_type', 'c')
        .in('item_id', colorIds);

      if (!likesError && likesData) {
        // Count likes per color code
        const likesCountMap = {};
        likesData.forEach(like => {
          likesCountMap[like.item_id] = (likesCountMap[like.item_id] || 0) + 1;
        });

        // Add likes_count to each color code
        colorCodes.forEach(color => {
          color.likes_count = likesCountMap[color.id] || 0;
        });
      }
    }

    res.json({
      colorCodes: colorCodes || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
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
        created_by_user:users!color_codes_created_by_fkey(username)
      `)
      .eq('id', id)
      .single();

    if (error || !colorCode) {
      return res.status(404).json({ error: 'Color code not found' });
    }

    // Get likes count
    const { count, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', 'c')
      .eq('item_id', id);

    if (!likesError) {
      colorCode.likes_count = count || 0;
    } else {
      colorCode.likes_count = 0;
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
