import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',               label: 'Dashboard',       icon: '🏠' },
  { to: '/cars',           label: 'Cars',             icon: '🚗' },
  { to: '/parking-slots',  label: 'Parking Slots',    icon: '🅿️'  },
  { to: '/parking-records',label: 'Parking Records',  icon: '📋' },
  { to: '/payments',       label: 'Payments',         icon: '💳' },
  { to: '/reports',        label: 'Reports',          icon: '📊' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="bg-blue-800 text-white shadow-lg z-30 relative">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🅿️</span>
              <div>
                <h1 className="text-lg font-bold leading-tight">SmartPark</h1>
                <p className="text-blue-200 text-xs leading-tight">Parking Space Sales Management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-blue-200 text-sm">
              👤 {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-56 bg-blue-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:flex md:flex-col
          pt-16 md:pt-0
        `}>
          <nav className="flex-1 py-4">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white border-r-4 border-blue-300'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-blue-700">
            <p className="text-blue-300 text-xs">Rubavu District, Rwanda</p>
            <p className="text-blue-400 text-xs">© 2025 SmartPark</p>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
