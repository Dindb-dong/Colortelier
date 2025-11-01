import { supabase } from '../config/supabase.js';
import { validateRequired, validateUUID } from '../utils/validation.js';

export const addToCart = async (req, res) => {
  try {
    const { type, id } = req.body;

    validateRequired(type, 'Type');
    validateRequired(id, 'ID');

    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    let itemType;
    let tableName;
    let foreignKey;

    if (type === 'color_code') {
      itemType = 'c';
      tableName = 'color_codes';
      foreignKey = 'color_codes_created_by_fkey';
    } else if (type === 'filter') {
      itemType = 'f';
      tableName = 'filters';
      foreignKey = 'filters_created_by_fkey';
    } else {
      return res.status(400).json({ error: 'Type must be either color_code or filter' });
    }

    // Check if item exists
    const { data: item } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', id)
      .single();

    if (!item) {
      return res.status(404).json({ error: `${type} not found` });
    }

    // Check if already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_type', itemType)
      .eq('item_id', id)
      .single();

    if (existingItem) {
      return res.status(409).json({ error: 'Item already in cart' });
    }

    // Add to cart
    const { data: cartItem, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: req.user.id,
        item_type: itemType,
        item_id: id
      })
      .select(`
        *,
        ${tableName}!inner(
          *,
          created_by_user:users!${foreignKey}(username)
        )
      `)
      .single();

    if (error) {
      console.error('Add to cart error:', error);
      return res.status(500).json({ error: 'Failed to add to cart' });
    }

    res.status(201).json({
      message: `${type} added to cart`,
      cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('cart_items')
      .select(`
        *,
        color_codes(
          *,
          created_by_user:users!color_codes_created_by_fkey(username)
        ),
        filters(
          *,
          created_by_user:users!filters_created_by_fkey(username)
        )
      `, { count: 'exact' })
      .eq('user_id', req.user.id);

    // Create count query with same filters
    let countQuery = supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // Filter by type if specified
    if (type === 'color_codes') {
      query = query.eq('item_type', 'c');
      countQuery = countQuery.eq('item_type', 'c');
    } else if (type === 'filters') {
      query = query.eq('item_type', 'f');
      countQuery = countQuery.eq('item_type', 'f');
    }

    // Get total count before pagination
    const { count: totalCount } = await countQuery;

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: cartItems, error } = await query;
    const count = totalCount || 0;

    if (error) {
      console.error('Get cart items error:', error);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    res.json({
      cartItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get cart items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    // Check if cart item exists and belongs to user
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Remove from cart
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Remove from cart error:', error);
      return res.status(500).json({ error: 'Failed to remove from cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Clear cart error:', error);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Get cart count error:', error);
      return res.status(500).json({ error: 'Failed to get cart count' });
    }

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
