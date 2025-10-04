import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.VITE_API_URL as string

// Get auth token from localStorage (backend JWT)
const getAuthToken = () => {
  const token = localStorage.getItem('authToken')
  console.log('getAuthToken', token)
  if (!token) {
    console.log('getAuthToken: No token found')

    return null
  }
  return token
}

// Set auth token
const setAuthToken = (token: string) => {
  console.log('setAuthToken', token)
  localStorage.setItem('authToken', token)
}

// Remove auth token
const removeAuthToken = () => {
  console.log('removeAuthToken')
  localStorage.removeItem('authToken')
}

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  console.log(API_BASE_URL)
  console.log('apiRequest', endpoint, options)
  const token = getAuthToken()
  if (!token) {
    console.log('apiRequest: No token found')
    return null
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

// FormData API request helper (for file uploads)
const apiRequestFormData = async (endpoint: string, formData: FormData, options: RequestInit = {}) => {
  console.log('apiRequestFormData', endpoint, formData, options)
  const token = getAuthToken()
  if (!token) {
    console.log('apiRequestFormData: No token found')
    return null
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method: options.method || 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

// 인증 API 함수들
export const authApi = {
  // 회원가입
  register: async (email: string, password: string, username?: string) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })

    // 토큰 저장
    if (result.token) {
      setAuthToken(result.token)
    }

    return result
  },

  // 로그인
  login: async (email: string, password: string) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    // 토큰 저장
    if (result.token) {
      setAuthToken(result.token)
    }

    return result
  },

  // 로그아웃
  logout: () => {
    removeAuthToken()
  },

  // 프로필 조회
  getProfile: async () => {
    return apiRequest('/auth/profile')
  },

  // 프로필 업데이트
  updateProfile: async (username?: string) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    })
  },

  // 토큰 확인
  isAuthenticated: () => {
    return !!getAuthToken()
  },
}

// 테마 API 함수들
export const themeApi = {
  // 테마 목록 조회
  getThemes: async (page = 1, limit = 20, search?: string, sort = 'created_at', order = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    })
    if (search) params.append('search', search)
    return apiRequest(`/themes?${params}`)
  },

  // 테마 상세 조회
  getThemeById: async (id: string) => {
    return apiRequest(`/themes/${id}`)
  },

  // 테마 생성 (어드민)
  createTheme: async (name: string, description: string, themeCode: string, thumbnailFile: File) => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('theme_code', themeCode)
    formData.append('thumbnail', thumbnailFile)

    return apiRequestFormData('/themes', formData)
  },

  // 테마 수정 (어드민)
  updateTheme: async (id: string, name?: string, description?: string, themeCode?: string, thumbnailFile?: File) => {
    const formData = new FormData()
    if (name !== undefined) formData.append('name', name)
    if (description !== undefined) formData.append('description', description)
    if (themeCode !== undefined) formData.append('theme_code', themeCode)
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile)

    return apiRequestFormData(`/themes/${id}`, formData, { method: 'PUT' })
  },

  // 테마 삭제 (어드민)
  deleteTheme: async (id: string) => {
    return apiRequest(`/themes/${id}`, {
      method: 'DELETE',
    })
  },
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
      order,
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
  // 필터 목록 조회
  getFilters: async (page = 1, limit = 20, search?: string, sort = 'created_at', order = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    })
    if (search) params.append('search', search)
    return apiRequest(`/filters?${params}`)
  },

  // 필터 상세 조회
  getFilterById: async (id: string) => {
    return apiRequest(`/filters/${id}`)
  },

  // 필터 생성 (어드민)
  createFilter: async (name: string, description: string, beforeImageFile: File, afterImageFile: File, xmpFile: File) => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('before_image', beforeImageFile)
    formData.append('after_image', afterImageFile)
    formData.append('xmp_file', xmpFile)

    return apiRequestFormData('/filters', formData)
  },

  // 필터 수정 (어드민)
  updateFilter: async (id: string, name?: string, description?: string, beforeImageFile?: File, afterImageFile?: File, xmpFile?: File) => {
    const formData = new FormData()
    if (name !== undefined) formData.append('name', name)
    if (description !== undefined) formData.append('description', description)
    if (beforeImageFile) formData.append('before_image', beforeImageFile)
    if (afterImageFile) formData.append('after_image', afterImageFile)
    if (xmpFile) formData.append('xmp_file', xmpFile)

    return apiRequestFormData(`/filters/${id}`, formData, { method: 'PUT' })
  },

  // 필터 삭제 (어드민)
  deleteFilter: async (id: string) => {
    return apiRequest(`/filters/${id}`, {
      method: 'DELETE',
    })
  },
}
