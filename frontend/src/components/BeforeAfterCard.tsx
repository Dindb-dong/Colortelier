import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartApi, likesApi } from '../utils/api'

type Props = {
  beforeUrl: string
  afterUrl: string
  title?: string
  filterId?: string
  showActions?: boolean
}

export default function BeforeAfterCard({ beforeUrl, afterUrl, title, filterId, showActions = false }: Props) {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!filterId || loading) return

    try {
      setLoading(true)
      await cartApi.addToCart('filter', filterId)
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
    if (!filterId || loading) return

    try {
      setLoading(true)
      const result = await likesApi.toggleFilterLike(filterId)
      setIsLiked(result.liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('좋아요 처리에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    if (filterId) {
      navigate(`/filters/${filterId}`)
    }
  }

  return (
    <figure
      className="card"
      style={{
        display: 'grid',
        gap: 10,
        position: 'relative',
        cursor: filterId ? 'pointer' : 'default'
      }}
      onClick={handleCardClick}
    >
      {title && <figcaption style={{ fontWeight: 700 }}>{title}</figcaption>}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <img src={beforeUrl} alt="Before" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
        <img src={afterUrl} alt="After" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
      </div>
      <div className="row muted" style={{ justifyContent: 'space-between' }}>
        <span>Before</span>
        <span>After</span>
      </div>

      {showActions && filterId && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '4px',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
          className="filter-card-actions"
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
    </figure>
  )
}

