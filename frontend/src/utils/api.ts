import { supabase } from '../lib/supabaseClient'

const API_BASE_URL = 'http://localhost:3001/api'

// Get auth token
const getAuthToken = async () => {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

// Cart API functions
export const cartApi = {
  addToCart: async (type: 'color_code' | 'filter', id: string) => {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    })
  },

  getCartItems: async (page = 1, limit = 20, type?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (type) params.append('type', type)
    return apiRequest(`/cart?${params}`)
  },

  removeFromCart: async (cartItemId: string) => {
    return apiRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    })
  },

  clearCart: async () => {
    return apiRequest('/cart', {
      method: 'DELETE',
    })
  },

  getCartCount: async () => {
    return apiRequest('/cart/count')
  },
}

// Likes API functions
export const likesApi = {
  toggleColorLike: async (colorCodeId: string) => {
    return apiRequest(`/likes/color-codes/${colorCodeId}`, {
      method: 'POST',
    })
  },

  toggleFilterLike: async (filterId: string) => {
    return apiRequest(`/likes/filters/${filterId}`, {
      method: 'POST',
    })
  },

  getUserLikes: async (type?: 'color_codes' | 'filters', page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (type) params.append('type', type)
    return apiRequest(`/likes/my-likes?${params}`)
  },

  checkLikeStatus: async (type: 'color_code' | 'filter', id: string) => {
    return apiRequest(`/likes/status?type=${type}&id=${id}`)
  },
}

// Color API functions
export const colorApi = {
  getColorCodes: async (page = 1, limit = 20, search?: string, sort = 'created_at', order = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order
    })
    if (search) params.append('search', search)
    return apiRequest(`/colors?${params}`)
  },

  getColorCodeById: async (id: string) => {
    return apiRequest(`/colors/${id}`)
  },

  createColorCode: async (colorData: any) => {
    return apiRequest('/colors', {
      method: 'POST',
      body: JSON.stringify(colorData),
    })
  },

  updateColorCode: async (id: string, updates: any) => {
    return apiRequest(`/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  deleteColorCode: async (id: string) => {
    return apiRequest(`/colors/${id}`, {
      method: 'DELETE',
    })
  },
}

// Filter API functions
export const filterApi = {
  getFilters: async (page = 1, limit = 20, search?: string, sort = 'created_at', order = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order
    })
    if (search) params.append('search', search)
    return apiRequest(`/filters?${params}`)
  },

  getFilterById: async (id: string) => {
    return apiRequest(`/filters/${id}`)
  },

  createFilter: async (filterData: any) => {
    return apiRequest('/filters', {
      method: 'POST',
      body: JSON.stringify(filterData),
    })
  },

  updateFilter: async (id: string, updates: any) => {
    return apiRequest(`/filters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  deleteFilter: async (id: string) => {
    return apiRequest(`/filters/${id}`, {
      method: 'DELETE',
    })
  },
}
