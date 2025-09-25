import AdminColorArchiver from '../components/AdminColorArchiver'
import ComplementRecommender from '../components/ComplementRecommender'

export default function AdminPage() {
  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <h1>Admin</h1>
      <AdminColorArchiver />
      <ComplementRecommender />
      <div>
        <h2>Photo Upload (Mock)</h2>
        <p style={{ color: '#888' }}>Upload disabled in frontend-only build.</p>
        <input type="file" disabled />
      </div>
    </section>
  )
}

