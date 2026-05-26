import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function ParkingSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ SlotNumber: '', SlotStatus: 'Available' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchSlots = async () => {
    try {
      const res = await api.get('/parking-slots')
      setSlots(res.data)
    } catch {
      setError('Failed to load parking slots.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSlots() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/parking-slots', form)
      setSuccess('Parking slot added successfully!')
      setForm({ SlotNumber: '', SlotStatus: 'Available' })
      fetchSlots()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot.')
    } finally {
      setSubmitting(false)
    }
  }

  const available = slots.filter(s => s.SlotStatus === 'Available').length
  const occupied  = slots.filter(s => s.SlotStatus === 'Occupied').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Parking Slots</h2>
        <p className="text-gray-500 text-sm">Manage parking slot availability</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{slots.length}</p>
          <p className="text-gray-500 text-sm">Total Slots</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{available}</p>
          <p className="text-gray-500 text-sm">Available</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{occupied}</p>
          <p className="text-gray-500 text-sm">Occupied</p>
        </div>
      </div>

      {/* Add Slot Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Parking Slot</h3>
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-3 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-3 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Number *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. A1, B2, P-01"
              value={form.SlotNumber}
              onChange={e => setForm({ ...form, SlotNumber: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input-field"
              value={form.SlotStatus}
              onChange={e => setForm({ ...form, SlotStatus: e.target.value })}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Adding...' : '+ Add Slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Slots Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parking Slots Overview</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No parking slots added yet.</p>
        ) : (
          <>
            {/* Visual grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-6">
              {slots.map(slot => (
                <div
                  key={slot._id}
                  className={`rounded-lg p-2 text-center text-xs font-bold border-2 ${
                    slot.SlotStatus === 'Available'
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : 'bg-red-100 border-red-400 text-red-800'
                  }`}
                >
                  <div className="text-lg">{slot.SlotStatus === 'Available' ? '🟢' : '🔴'}</div>
                  {slot.SlotNumber}
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left rounded-tl-lg">#</th>
                    <th className="px-4 py-3 text-left">Slot Number</th>
                    <th className="px-4 py-3 text-left rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, i) => (
                    <tr key={slot._id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">{slot.SlotNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          slot.SlotStatus === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.SlotStatus === 'Available' ? '🟢' : '🔴'} {slot.SlotStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
