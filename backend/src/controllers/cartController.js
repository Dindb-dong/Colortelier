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

    // Add to cart - insert first
    const { data: insertedCartItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: req.user.id,
        item_type: itemType,
        item_id: id
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Add to cart error:', insertError);
      return res.status(500).json({ error: 'Failed to add to cart' });
    }

    // Fetch the related item data separately since there's no direct foreign key
    let itemData = null;
    if (itemType === 'c') {
      const { data: colorCode, error: colorError } = await supabase
        .from('color_codes')
        .select(`
          *,
          created_by_user:users!color_codes_created_by_fkey(username)
        `)
        .eq('id', id)
        .single();
      
      if (!colorError && colorCode) {
        itemData = { color_codes: colorCode };
      }
    } else if (itemType === 'f') {
      const { data: filter, error: filterError } = await supabase
        .from('filters')
        .select(`
          *,
          created_by_user:users!filters_created_by_fkey(username)
        `)
        .eq('id', id)
        .single();
      
      if (!filterError && filter) {
        itemData = { filters: filter };
      }
    }

    // Combine cart item with related data
    const cartItem = {
      ...insertedCartItem,
      ...itemData
    };

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

    // Build base query for cart items
    let cartQuery = supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.id);

    let countQuery = supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // Filter by type if specified
    if (type === 'color_codes') {
      cartQuery = cartQuery.eq('item_type', 'c');
      countQuery = countQuery.eq('item_type', 'c');
    } else if (type === 'filters') {
      cartQuery = cartQuery.eq('item_type', 'f');
      countQuery = countQuery.eq('item_type', 'f');
    }

    // Get total count
    const { count: totalCount } = await countQuery;

    // Apply pagination and ordering
    cartQuery = cartQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: cartItems, error: cartError } = await cartQuery;

    if (cartError) {
      console.error('Get cart items error:', cartError);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.json({
        cartItems: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      });
    }

    // Fetch related items separately
    const colorCodeIds = cartItems.filter(c => c.item_type === 'c').map(c => c.item_id);
    const filterIds = cartItems.filter(c => c.item_type === 'f').map(c => c.item_id);

    const cartItemsWithData = [];

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
        cartItems.forEach(item => {
          if (item.item_type === 'c' && colorCodesMap.has(item.item_id)) {
            cartItemsWithData.push({
              ...item,
              color_codes: colorCodesMap.get(item.item_id)
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
        cartItems.forEach(item => {
          if (item.item_type === 'f' && filtersMap.has(item.item_id)) {
            cartItemsWithData.push({
              ...item,
              filters: filtersMap.get(item.item_id)
            });
          }
        });
      }
    }

    // If type is specified, return only that type. Otherwise merge both.
    let resultCartItems;
    if (type === 'color_codes') {
      resultCartItems = cartItemsWithData.filter(c => c.item_type === 'c');
    } else if (type === 'filters') {
      resultCartItems = cartItemsWithData.filter(c => c.item_type === 'f');
    } else {
      // Merge both types, maintaining order
      resultCartItems = cartItems.map(item => {
        const withData = cartItemsWithData.find(c => c.id === item.id);
        return withData || item;
      });
    }

    res.json({
      cartItems: resultCartItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
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
