import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    totalRecords: 0,
    totalPayments: 0,
    todayRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cars, slots, records, payments, dailyReport] = await Promise.all([
          api.get('/cars'),
          api.get('/parking-slots'),
          api.get('/parking-records'),
          api.get('/payments'),
          api.get('/payments/report/daily'),
        ])
        const available = slots.data.filter(s => s.SlotStatus === 'Available').length
        const occupied  = slots.data.filter(s => s.SlotStatus === 'Occupied').length
        const todayRevenue = dailyReport.data.reduce((sum, p) => sum + (p.AmountPaid || 0), 0)
        setStats({
          totalCars:     cars.data.length,
          totalSlots:    slots.data.length,
          availableSlots: available,
          occupiedSlots:  occupied,
          totalRecords:  records.data.length,
          totalPayments: payments.data.length,
          todayRevenue,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Cars',       value: stats.totalCars,      icon: '🚗', color: 'bg-blue-500',   link: '/cars' },
    { label: 'Total Slots',      value: stats.totalSlots,     icon: '🅿️',  color: 'bg-indigo-500', link: '/parking-slots' },
    { label: 'Available Slots',  value: stats.availableSlots, icon: '✅', color: 'bg-green-500',  link: '/parking-slots' },
    { label: 'Occupied Slots',   value: stats.occupiedSlots,  icon: '🔴', color: 'bg-red-500',    link: '/parking-slots' },
    { label: 'Parking Records',  value: stats.totalRecords,   icon: '📋', color: 'bg-yellow-500', link: '/parking-records' },
    { label: 'Total Payments',   value: stats.totalPayments,  icon: '💳', color: 'bg-purple-500', link: '/payments' },
    { label: "Today's Revenue",  value: `${stats.todayRevenue.toLocaleString()} Rwf`, icon: '💰', color: 'bg-teal-500', link: '/reports' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome to SmartPark Management System</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.link}
            className="card hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className={`${card.color} text-white rounded-xl p-3 text-2xl group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/parking-records" className="btn-primary text-sm">+ New Parking Entry</Link>
          <Link to="/payments" className="btn-success text-sm">+ Record Payment</Link>
          <Link to="/reports" className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">📊 View Reports</Link>
        </div>
      </div>
    </div>
  )
}
