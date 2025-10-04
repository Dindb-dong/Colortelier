import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { filterApi, cartApi, likesApi } from '../utils/api'

export default function FilterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchFilter()
      checkLikeStatus()
    }
  }, [id])

  const fetchFilter = async () => {
    try {
      setLoading(true)
      const response = await filterApi.getFilterById(id!)
      setFilter(response.filter)
    } catch (err) {
      console.error('Error fetching filter:', err)
      setError('필터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const response = await likesApi.checkLikeStatus('filter', id!)
      setIsLiked(response.liked)
    } catch (err) {
      console.error('Error checking like status:', err)
    }
  }

  const handleAddToCart = async () => {
    if (!id || actionLoading) return

    try {
      setActionLoading(true)
      await cartApi.addToCart('filter', id)
      setIsInCart(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('장바구니에 추가하는데 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleLike = async () => {
    if (!id || actionLoading) return

    try {
      setActionLoading(true)
      const result = await likesApi.toggleFilterLike(id)
      setIsLiked(result.liked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('좋아요 처리에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>필터를 불러오는 중...</div>
      </div>
    )
  }

  if (error || !filter) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error || '필터를 찾을 수 없습니다.'}</div>
        <button
          onClick={() => navigate('/filters')}
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
          필터 목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/filters')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          ← 목록으로 돌아가기
        </button>
      </div>

      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '32px',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#333' }}>
              {filter.name}
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 16px 0' }}>
              by {filter.created_by_user.username}
            </p>

            {filter.description && (
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                {filter.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleToggleLike}
              disabled={actionLoading}
              style={{
                padding: '12px 20px',
                backgroundColor: isLiked ? '#e74c3c' : '#f8f9fa',
                color: isLiked ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {actionLoading ? '⏳' : (isLiked ? '❤️' : '🤍')}
              {isLiked ? '좋아요 취소' : '좋아요'}
            </button>

            <button
              onClick={handleAddToCart}
              disabled={actionLoading || isInCart}
              style={{
                padding: '12px 20px',
                backgroundColor: isInCart ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (actionLoading || isInCart) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {actionLoading ? '⏳' : (isInCart ? '✅' : '🛒')}
              {isInCart ? '장바구니에 추가됨' : '장바구니에 추가'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#333' }}>
                Before
              </h3>
              <img
                src={filter.before_image_url || `https://picsum.photos/seed/b${filter.id}/600/400`}
                alt="Before"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#333' }}>
                After
              </h3>
              <img
                src={filter.after_image_url || `https://picsum.photos/seed/a${filter.id}/600/400`}
                alt="After"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
            </div>
          </div>

          {filter.filter_data && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#333' }}>
                필터 설정
              </h3>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#333',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(filter.filter_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
