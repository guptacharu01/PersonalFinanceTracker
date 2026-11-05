import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Budget from './pages/Budget.jsx'

// Redirects unauthenticated visitors to the login page.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-8 text-slate-500">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Sidebar on desktop, simple top navigation on mobile.
function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/budget', label: 'Budget' }
  ]
  function handleLogout() {
    logout()
    navigate('/login')
  }
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-slate-900 text-white md:w-60 md:min-h-screen md:sticky md:top-0">
        <div className="px-5 py-5">
          <p className="text-lg font-bold">Finance Tracker</p>
          {user && <p className="mt-1 text-sm text-slate-300">Hi, {user.name}</p>}
        </div>
        <nav className="flex gap-1 px-3 pb-3 md:flex-col">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded px-3 py-2 text-sm ${location.pathname === link.to ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800">
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
