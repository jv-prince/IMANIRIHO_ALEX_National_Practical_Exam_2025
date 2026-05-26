import React, { useEffect, useState } from 'react'
import api from '../api/axios'

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-RW', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(hours) {
  if (hours == null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function ParkingRecords() {
  const [records, setRecords]   = useState([])
  const [cars, setCars]         = useState([])
  const [slots, setSlots]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Entry form
  const [entryForm, setEntryForm] = useState({
    PlateNumber: '', SlotNumber: '', EntryTime: new Date().toISOString().slice(0, 16),
  })

  // Edit modal
  const [editRecord, setEditRecord] = useState(null)
  const [exitTime, setExitTime]     = useState('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)

  const fetchAll = async () => {
    try {
      const [rec, c, s] = await Promise.all([
        api.get('/parking-records'),
        api.get('/cars'),
        api.get('/parking-slots'),
      ])
      setRecords(rec.data)
      setCars(c.data)
      setSlots(s.data)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleEntry = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/parking-records', entryForm)
      setSuccess('Parking entry recorded successfully!')
      setEntryForm({ PlateNumber: '', SlotNumber: '', EntryTime: new Date().toISOString().slice(0, 16) })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.put(`/parking-records/${editRecord._id}`, { ExitTime: exitTime })
      setSuccess('Exit time recorded. Duration calculated.')
      setEditRecord(null)
      setExitTime('')
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/parking-records/${deleteId}`)
      setSuccess('Record deleted.')
      setDeleteId(null)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.')
    }
  }

  const availableSlots = slots.filter(s => s.SlotStatus === 'Available')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Parking Records</h2>
        <p className="text-gray-500 text-sm">Record car entries and exits</p>
      </div>

      {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">{success}</div>}

      {/* Entry Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Car Entry</h3>
        <form onSubmit={handleEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
            <select
              className="input-field"
              value={entryForm.PlateNumber}
              onChange={e => setEntryForm({ ...entryForm, PlateNumber: e.target.value })}
              required
            >
              <option value="">-- Select Car --</option>
              {cars.map(c => (
                <option key={c._id} value={c.PlateNumber}>
                  {c.PlateNumber} — {c.DriverName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parking Slot *</label>
            <select
              className="input-field"
              value={entryForm.SlotNumber}
              onChange={e => setEntryForm({ ...entryForm, SlotNumber: e.target.value })}
              required
            >
              <option value="">-- Select Available Slot --</option>
              {availableSlots.map(s => (
                <option key={s._id} value={s.SlotNumber}>{s.SlotNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time *</label>
            <input
              type="datetime-local"
              className="input-field"
              value={entryForm.EntryTime}
              onChange={e => setEntryForm({ ...entryForm, EntryTime: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Recording...' : '+ Record Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Records Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Parking Records ({records.length})</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-3 text-left rounded-tl-lg">#</th>
                  <th className="px-3 py-3 text-left">Plate No.</th>
                  <th className="px-3 py-3 text-left">Slot</th>
                  <th className="px-3 py-3 text-left">Entry Time</th>
                  <th className="px-3 py-3 text-left">Exit Time</th>
                  <th className="px-3 py-3 text-left">Duration</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No records found.</td></tr>
                ) : records.map((rec, i) => (
                  <tr key={rec._id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3 font-semibold text-blue-700">{rec.PlateNumber}</td>
                    <td className="px-3 py-3">{rec.SlotNumber}</td>
                    <td className="px-3 py-3 text-xs">{formatDateTime(rec.EntryTime)}</td>
                    <td className="px-3 py-3 text-xs">{formatDateTime(rec.ExitTime)}</td>
                    <td className="px-3 py-3">{formatDuration(rec.Duration)}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rec.ExitTime
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rec.ExitTime ? 'Completed' : '🟡 Parked'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {!rec.ExitTime && (
                          <button
                            onClick={() => {
                              setEditRecord(rec)
                              setExitTime(new Date().toISOString().slice(0, 16))
                            }}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded font-medium"
                          >
                            Exit
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(rec._id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Exit Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Car Exit</h3>
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
              <p><strong>Plate:</strong> {editRecord.PlateNumber}</p>
              <p><strong>Slot:</strong> {editRecord.SlotNumber}</p>
              <p><strong>Entry:</strong> {formatDateTime(editRecord.EntryTime)}</p>
            </div>
            <form onSubmit={handleExit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time *</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={exitTime}
                  onChange={e => setExitTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditRecord(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Record Exit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to permanently delete this parking record? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
