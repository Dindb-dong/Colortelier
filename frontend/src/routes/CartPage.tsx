import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface CartItem {
  id: string
  item_type: 'c' | 'f'
  item_id: string
  created_at: string
  color_codes?: {
    id: string
    name: string
    color_code: string
    hex_code: string
    description: string
    created_by_user: {
      username: string
    }
  }
  filters?: {
    id: string
    name: string
    filter_data: any
    description: string
    created_by_user: {
      username: string
    }
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      if (!supabase) {
        setError('Supabase가 초기화되지 않았습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase.from('cart_items').select(`
        *,
        color_codes(
          *,
          created_by_user:users!color_codes_created_by_fkey(username)
        ),
        filters(
          *,
          created_by_user:users!filters_created_by_fkey(username)
        )
      `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCartItems(data || [])
    } catch (err) {
      console.error('Error fetching cart items:', err)
      setError('장바구니를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (!supabase) {
        setError('Supabase가 초기화되지 않았습니다.')
        return
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

      if (error) throw error

      setCartItems(prev => prev.filter(item => item.id !== cartItemId))
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('아이템을 제거하는데 실패했습니다.')
    }
  }

  const clearCart = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return

    try {
      if (!supabase) {
        setError('Supabase가 초기화되지 않았습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('장바구니를 비우는데 실패했습니다.')
    }
  }

  const handleItemClick = (item: CartItem) => {
    if (item.item_type === 'c' && item.color_codes) {
      navigate(`/palettes?color=${item.color_codes.id}`)
    } else if (item.item_type === 'f' && item.filters) {
      navigate(`/filters?filter=${item.filters.id}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>장바구니를 불러오는 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
        <button
          onClick={fetchCartItems}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>장바구니</h1>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            전체 삭제
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#333' }}>장바구니가 비어있습니다</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>마음에 드는 컬러나 필터를 추가해보세요!</p>
          <button
            onClick={() => navigate('/palettes')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '12px'
            }}
          >
            컬러 둘러보기
          </button>
          <button
            onClick={() => navigate('/filters')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            필터 둘러보기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {cartItems.map((item) => {
            const isColorCode = item.item_type === 'c'
            const itemData = isColorCode ? item.color_codes : item.filters

            if (!itemData) return null

            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleItemClick(item)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: isColorCode && 'hex_code' in itemData ? itemData.hex_code : '#6366f1',
                          border: '2px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}
                      >
                        {isColorCode ? '🎨' : '🔧'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>
                          {itemData.name}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                          by {itemData.created_by_user.username}
                        </p>
                      </div>
                    </div>

                    {itemData.description && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '8px 0', lineHeight: '1.4' }}>
                        {itemData.description}
                      </p>
                    )}

                    {isColorCode && 'hex_code' in itemData && (
                      <div style={{ marginTop: '12px' }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#666',
                          backgroundColor: '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {itemData.hex_code}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromCart(item.id)
                    }}
                    style={{
                      padding: '8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="장바구니에서 제거"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
