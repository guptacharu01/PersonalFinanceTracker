import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // On refresh, check the saved token is still valid before trusting it.
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => { setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user') })
      .finally(() => setLoading(false))
  }, [])

  function saveSession(data) {
    localStorage.setItem('token', data.token)
    const profile = { userId: data.userId, name: data.name, email: data.email }
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data)
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password })
    saveSession(res.data)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
