import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="section-page" style={{ padding: '84px 16px 32px', textAlign: 'center' }}>
      <h2>404 — Page Not Found</h2>
      <p style={{ marginTop: '1rem', color: 'var(--text2)' }}>
        <Link to="/">← Back to Home</Link>
      </p>
    </div>
  )
}
