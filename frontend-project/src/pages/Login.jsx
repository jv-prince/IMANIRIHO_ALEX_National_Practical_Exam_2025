import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please enter username and password.'); return }
    setBusy(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <span className="text-blue-800 font-extrabold text-3xl">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-white">SmartPark</h1>
          <p className="text-blue-200 mt-1">Employee Payroll Management System</p>
          <p className="text-blue-300 text-sm">Rubavu District · Western Province · Rwanda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Access your HR account</p>

          {error && <div className="alert-error mb-4">⚠️ {error}</div>}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" name="username" type="text"
                value={form.username} onChange={onChange}
                className="input" placeholder="Enter username"
                autoComplete="username" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password"
                value={form.password} onChange={onChange}
                className="input" placeholder="Enter password"
                autoComplete="current-password" required />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center py-3 text-base">
              {busy
                ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Signing in…</>
                : '🔐 Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
            Default: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © 2025 SmartPark EPMS · IMANIRIHO ALEX
        </p>
      </div>
    </div>
  )
}
