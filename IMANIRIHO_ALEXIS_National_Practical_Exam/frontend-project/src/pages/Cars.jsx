import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ PlateNumber: '', DriverName: '', PhoneNumber: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars')
      setCars(res.data)
    } catch (err) {
      setError('Failed to load cars.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCars() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/cars', form)
      setSuccess('Car registered successfully!')
      setForm({ PlateNumber: '', DriverName: '', PhoneNumber: '' })
      fetchCars()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register car.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = cars.filter(c =>
    c.PlateNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.DriverName.toLowerCase().includes(search.toLowerCase()) ||
    c.PhoneNumber.includes(search)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cars</h2>
        <p className="text-gray-500 text-sm">Register and view cars in the system</p>
      </div>

      {/* Registration Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Register New Car</h3>
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-3 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-3 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. RAB 123 A"
              value={form.PlateNumber}
              onChange={e => setForm({ ...form, PlateNumber: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Full name"
              value={form.DriverName}
              onChange={e => setForm({ ...form, DriverName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 0788123456"
              value={form.PhoneNumber}
              onChange={e => setForm({ ...form, PhoneNumber: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Registering...' : '+ Register Car'}
            </button>
          </div>
        </form>
      </div>

      {/* Cars Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Registered Cars ({filtered.length})</h3>
          <input
            type="text"
            className="input-field sm:w-64"
            placeholder="Search by plate, name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left rounded-tl-lg">#</th>
                  <th className="px-4 py-3 text-left">Plate Number</th>
                  <th className="px-4 py-3 text-left">Driver Name</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No cars found.</td></tr>
                ) : filtered.map((car, i) => (
                  <tr key={car._id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{car.PlateNumber}</td>
                    <td className="px-4 py-3">{car.DriverName}</td>
                    <td className="px-4 py-3">{car.PhoneNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
