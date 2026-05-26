import React, { useEffect, useState, useRef } from 'react'
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

export default function Payments() {
  const [payments, setPayments]   = useState([])
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]           = useState({ ParkingRecordId: '', PaymentDate: new Date().toISOString().slice(0, 10) })
  const [bill, setBill]           = useState(null)
  const [billLoading, setBillLoading] = useState(false)
  const billRef = useRef()

  const fetchAll = async () => {
    try {
      const [p, r] = await Promise.all([
        api.get('/payments'),
        api.get('/parking-records'),
      ])
      setPayments(p.data)
      // Only show completed records (with exit time) that don't have a payment yet
      const paidIds = new Set(p.data.map(pay => pay.ParkingRecordId))
      setRecords(r.data.filter(rec => rec.ExitTime && !paidIds.has(rec._id)))
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Preview bill when record is selected
  useEffect(() => {
    if (!form.ParkingRecordId) { setBill(null); return }
    setBillLoading(true)
    api.get(`/payments/bill/${form.ParkingRecordId}`)
      .then(res => setBill(res.data))
      .catch(() => setBill(null))
      .finally(() => setBillLoading(false))
  }, [form.ParkingRecordId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/payments', form)
      setSuccess('Payment recorded successfully!')
      setForm({ ParkingRecordId: '', PaymentDate: new Date().toISOString().slice(0, 10) })
      setBill(null)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    const content = billRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>SmartPark Bill</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { border: 1px solid #ddd; padding: 8px 12px; }
        th { background: #1e40af; color: white; }
        .total { font-size: 1.2em; font-weight: bold; color: #16a34a; }
      </style></head>
      <body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
        <p className="text-gray-500 text-sm">Record parking payments and generate bills</p>
      </div>

      {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Parking Record *</label>
              <select
                className="input-field"
                value={form.ParkingRecordId}
                onChange={e => setForm({ ...form, ParkingRecordId: e.target.value })}
                required
              >
                <option value="">-- Select completed record --</option>
                {records.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.PlateNumber} | Slot {r.SlotNumber} | {formatDateTime(r.EntryTime)}
                  </option>
                ))}
              </select>
              {records.length === 0 && !loading && (
                <p className="text-xs text-gray-400 mt-1">No unpaid completed records available.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.PaymentDate}
                onChange={e => setForm({ ...form, PaymentDate: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={submitting || !form.ParkingRecordId} className="btn-primary w-full">
              {submitting ? 'Processing...' : '💳 Record Payment'}
            </button>
          </form>
        </div>

        {/* Bill Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Bill Preview</h3>
            {bill && (
              <button onClick={handlePrint} className="btn-secondary text-sm">🖨️ Print Bill</button>
            )}
          </div>
          {billLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bill ? (
            <div ref={billRef}>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">🅿️ SmartPark</h2>
                <p className="text-gray-500 text-sm">Rubavu District, Rwanda</p>
                <p className="text-gray-400 text-xs">Parking Invoice</p>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Plate Number', bill.PlateNumber],
                    ['Entry Time',   formatDateTime(bill.EntryTime)],
                    ['Exit Time',    formatDateTime(bill.ExitTime)],
                    ['Duration',     formatDuration(bill.Duration)],
                    ['Payment Date', bill.PaymentDate ? formatDateTime(bill.PaymentDate) : 'Pending'],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-2 text-gray-500 font-medium w-1/2">{label}</td>
                      <td className="py-2 font-semibold">{value}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50">
                    <td className="py-3 text-gray-700 font-bold text-base">Amount Due</td>
                    <td className="py-3 text-green-700 font-bold text-xl">{bill.AmountPaid?.toLocaleString()} Rwf</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3 text-center">Rate: 500 Rwf/hour (minimum 1 hour)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-4xl mb-2">🧾</span>
              <p className="text-sm">Select a parking record to preview the bill</p>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History ({payments.length})</h3>
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
                  <th className="px-4 py-3 text-left">Amount Paid</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No payments recorded yet.</td></tr>
                ) : payments.map((p, i) => (
                  <tr key={p._id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{p.PlateNumber}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{p.AmountPaid?.toLocaleString()} Rwf</td>
                    <td className="px-4 py-3 text-xs">{formatDateTime(p.PaymentDate)}</td>
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
