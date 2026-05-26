import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, getDepartments, getSalaries } from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'

function StatCard({ title, value, icon, border, to }) {
  return (
    <Link to={to} className={`card p-5 border-l-4 ${border} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState({ emp: 0, dept: 0, sal: 0, net: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEmployees(), getDepartments(), getSalaries()])
      .then(([e, d, s]) => setStats({
        emp:  e.data.length,
        dept: d.data.length,
        sal:  s.data.length,
        net:  s.data.reduce((a, r) => a + (r.netSalary || 0), 0),
      }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const rwf = (n) => Number(n).toLocaleString() + ' RWF'

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.username}! 👋</h1>
          <p className="text-blue-200 mt-1">SmartPark Employee Payroll Management System</p>
          <p className="text-blue-300 text-sm">Rubavu District · Western Province · Rwanda</p>
        </div>
        <div className="text-right">
          <p className="text-blue-200 text-xs">Today</p>
          <p className="text-white font-semibold">
            {new Date().toLocaleDateString('en-RW', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      {loading
        ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-7 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        : <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Employees"  value={stats.emp}    icon="👥" border="border-blue-500"   to="/employees" />
            <StatCard title="Departments"       value={stats.dept}   icon="🏢" border="border-green-500"  to="/departments" />
            <StatCard title="Salary Records"    value={stats.sal}    icon="💰" border="border-yellow-500" to="/salaries" />
            <StatCard title="Total Net Paid"    value={rwf(stats.net)} icon="📈" border="border-purple-500" to="/reports" />
          </div>
      }

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to:'/employees',   bg:'bg-blue-50   hover:bg-blue-100',   color:'text-blue-800',   icon:'➕', label:'Add Employee' },
            { to:'/departments', bg:'bg-green-50  hover:bg-green-100',  color:'text-green-800',  icon:'🏢', label:'Departments' },
            { to:'/salaries',    bg:'bg-yellow-50 hover:bg-yellow-100', color:'text-yellow-800', icon:'💵', label:'Process Salary' },
            { to:'/reports',     bg:'bg-purple-50 hover:bg-purple-100', color:'text-purple-800', icon:'📊', label:'View Reports' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`flex flex-col items-center p-4 ${a.bg} rounded-xl transition-colors text-center`}>
              <span className="text-3xl mb-2">{a.icon}</span>
              <span className={`text-sm font-semibold ${a.color}`}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">System Information</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 text-sm">
          {[
            ['Company',    'SmartPark'],
            ['Location',   'Rubavu District, Rwanda'],
            ['System',     'EPMS v1.0'],
            ['Logged in',  user?.username],
            ['Role',       user?.role],
            ['Developer',  'IMANIRIHO ALEX'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium capitalize">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
