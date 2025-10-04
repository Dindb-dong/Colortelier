import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartApi, likesApi } from '../utils/api'

type Props = {
  hex: string
  name: string
  colorId?: string
  showActions?: boolean
}

export default function ColorCard({ hex, name, colorId, showActions = false }: Props) {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!colorId || loading) return

    try {
      setLoading(true)
      await cartApi.addToCart('color_code', colorId)
      setIsInCart(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('장바구니에 추가하는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!colorId || loading) return

    try {
      setLoading(true)
      const result = await likesApi.toggleColorLike(colorId)
      setIsLiked(result.liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('좋아요 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    if (colorId) {
      navigate(`/palettes/${colorId}`)
    }
  }

  return (
    <div
      className="color-card"
      style={{
        display: 'grid',
        gap: 8,
        placeItems: 'center',
        position: 'relative',
        cursor: colorId ? 'pointer' : 'default'
      }}
      onClick={handleCardClick}
    >
      <div style={{ width: 120, height: 100, borderRadius: 10, background: hex, border: '1px solid rgba(255,255,255,0.8)' }} />
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: '8px 10px', width: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        <div style={{ fontWeight: 800 }}>{hex.replace('#', '').toUpperCase()}</div>
        <div style={{ color: '#111827', fontSize: 14 }}>{name}</div>
      </div>

      {showActions && colorId && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '4px',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
          className="color-card-actions"
        >
          <button
            onClick={handleToggleLike}
            disabled={loading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isLiked ? '#e74c3c' : '#f8f9fa',
              color: isLiked ? 'white' : '#6c757d',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            title={isLiked ? '좋아요 취소' : '좋아요'}
          >
            {loading ? '⏳' : (isLiked ? '❤️' : '🤍')}
          </button>

          <button
            onClick={handleAddToCart}
            disabled={loading || isInCart}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isInCart ? '#28a745' : '#f8f9fa',
              color: isInCart ? 'white' : '#6c757d',
              cursor: (loading || isInCart) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            title={isInCart ? '장바구니에 추가됨' : '장바구니에 추가'}
          >
            {loading ? '⏳' : (isInCart ? '✅' : '🛒')}
          </button>
        </div>
      )}
    </div>
  )
}


