import { createContext, useContext, useState, useEffect } from 'react'
import { getMeAPI, loginAPI, logoutAPI } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMeAPI()
      .then(res => setUser(res.data.loggedIn ? res.data.user : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await loginAPI({ username, password })
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await logoutAPI()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
