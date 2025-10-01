import AdminColorArchiver from '../components/AdminColorArchiver'
import ComplementRecommender from '../components/ComplementRecommender'
import { useAuthStore } from '../store/ui'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <h1>Admin Page</h1>
      <AdminColorArchiver />
      <ComplementRecommender />
      <div>
        <h2>Photo Upload (Mock)</h2>
        <p style={{ color: '#888' }}>Upload disabled in frontend-only build.</p>
        <input type="file" disabled />
      </div>
      <button
        style={{ backgroundColor: '#000', color: '#fff', borderColor: '#000', borderRadius: 9999, padding: '8px 16px', width: '40%', margin: '0 auto' }}
        onClick={() => {
          logout()
          navigate('/')
        }}>Logout</button>
    </section>
  )
}

