import axios from 'axios'

// VITE_API_URL is only needed if the frontend is NOT served through the Vite
// dev server proxy (see vite.config.js). In normal local development this
// stays '/api' and Vite forwards it to http://localhost:8080.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// Attach the JWT saved at login to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A 401 means the token expired or is missing: clear it so the app
// redirects to the login page instead of showing stale data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Small helper so pages show the backend's message instead of a generic error.
export function errorMessage(error, fallback) {
  return error?.response?.data?.message || fallback || 'Something went wrong. Please try again.'
}

export default api
