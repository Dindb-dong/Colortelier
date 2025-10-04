import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { colorApi, cartApi, likesApi } from '../utils/api'

export default function ColorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [colorCode, setColorCode] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchColorCode()
      checkLikeStatus()
    }
  }, [id])

  const fetchColorCode = async () => {
    try {
      setLoading(true)
      const response = await colorApi.getColorCodeById(id!)
      setColorCode(response.colorCode)
    } catch (err) {
      console.error('Error fetching color code:', err)
      setError('컬러 코드를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const response = await likesApi.checkLikeStatus('color_code', id!)
      setIsLiked(response.liked)
    } catch (err) {
      console.error('Error checking like status:', err)
    }
  }

  const handleAddToCart = async () => {
    if (!id || actionLoading) return

    try {
      setActionLoading(true)
      await cartApi.addToCart('color_code', id)
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
      const result = await likesApi.toggleColorLike(id)
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
        <div style={{ fontSize: '18px', color: '#666' }}>컬러 코드를 불러오는 중...</div>
      </div>
    )
  }

  if (error || !colorCode) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error || '컬러 코드를 찾을 수 없습니다.'}</div>
        <button
          onClick={() => navigate('/palettes')}
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
          컬러 목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/palettes')}
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
              {colorCode.name || colorCode.color_code}
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 16px 0' }}>
              by {colorCode.created_by_user.username}
            </p>

            {colorCode.description && (
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                {colorCode.description}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                backgroundColor: colorCode.hex_code,
                border: '2px solid #e0e0e0',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#333' }}>
                컬러 정보
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>HEX:</span>
                  <code style={{
                    backgroundColor: '#f8f9fa',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {colorCode.hex_code}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold' }}>RGB:</span>
                  <code style={{
                    backgroundColor: '#f8f9fa',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {colorCode.rgb_r}, {colorCode.rgb_g}, {colorCode.rgb_b}
                  </code>
                </div>
                {colorCode.hsl_h !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>HSL:</span>
                    <code style={{
                      backgroundColor: '#f8f9fa',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {colorCode.hsl_h}°, {colorCode.hsl_s}%, {colorCode.hsl_l}%
                    </code>
                  </div>
                )}
                {colorCode.cmyk_c !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>CMYK:</span>
                    <code style={{
                      backgroundColor: '#f8f9fa',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {colorCode.cmyk_c}%, {colorCode.cmyk_m}%, {colorCode.cmyk_y}%, {colorCode.cmyk_k}%
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
