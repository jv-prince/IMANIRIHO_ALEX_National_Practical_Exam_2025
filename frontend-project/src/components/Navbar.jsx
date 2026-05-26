import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/',            label: 'Dashboard',   icon: '🏠' },
  { to: '/employees',   label: 'Employees',   icon: '👥' },
  { to: '/departments', label: 'Departments', icon: '🏢' },
  { to: '/salaries',    label: 'Salary',      icon: '💰' },
  { to: '/reports',     label: 'Reports',     icon: '📊' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location         = useLocation()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const active = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1">
              <span className="text-blue-800 font-extrabold text-lg leading-none">SP</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">SmartPark</p>
              <p className="text-blue-200 text-xs leading-tight">EPMS — Payroll System</p>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active(l.to)
                    ? 'bg-white text-blue-800'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-blue-300 text-xs capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              🚪 Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-blue-700"
            aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active(l.to) ? 'bg-white text-blue-800' : 'text-blue-100 hover:bg-blue-700'
                }`}>
                <span>{l.icon}</span><span>{l.label}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between px-3 pt-3 border-t border-blue-700">
              <span className="text-blue-200 text-sm">{user?.username}</span>
              <button onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
