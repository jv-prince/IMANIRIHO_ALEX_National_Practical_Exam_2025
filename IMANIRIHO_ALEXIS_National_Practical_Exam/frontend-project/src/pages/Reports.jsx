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

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate]         = useState(today)
  const [report, setReport]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const reportRef = useRef()

  const fetchReport = async (d) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/payments/report/daily?date=${d}`)
      setReport(res.data)
    } catch {
      setError('Failed to load report.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport(today) }, [])

  const totalRevenue = report.reduce((sum, r) => sum + (r.AmountPaid || 0), 0)

  const handlePrint = () => {
    const content = reportRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>SmartPark Daily Report - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { color: #1e40af; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; }
        th { background: #1e40af; color: white; }
        tfoot td { font-weight: bold; background: #f0fdf4; }
        .header { text-align: center; margin-bottom: 20px; }
      </style></head>
      <body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500 text-sm">Daily parking payment reports</p>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              className="input-field sm:max-w-xs"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchReport(date)}
            className="btn-primary"
          >
            🔍 Generate Report
          </button>
          {report.length > 0 && (
            <button onClick={handlePrint} className="btn-secondary">
              🖨️ Print Report
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>}

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-700">{report.length}</p>
            <p className="text-gray-500 text-sm">Transactions</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-700">{totalRevenue.toLocaleString()} Rwf</p>
            <p className="text-gray-500 text-sm">Total Revenue</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-purple-700">
              {report.length > 0 ? Math.round(totalRevenue / report.length).toLocaleString() : 0} Rwf
            </p>
            <p className="text-gray-500 text-sm">Avg. per Transaction</p>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="card" ref={reportRef}>
        <div className="header text-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">🅿️ SmartPark — Daily Parking Report</h2>
          <p className="text-gray-500 text-sm">Rubavu District, Rwanda</p>
          <p className="text-gray-600 font-medium">
            Date: {new Date(date + 'T00:00:00').toLocaleDateString('en-RW', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
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
                  <th className="px-3 py-3 text-left rounded-tl-lg">#</th>
                  <th className="px-3 py-3 text-left">Plate Number</th>
                  <th className="px-3 py-3 text-left">Entry Time</th>
                  <th className="px-3 py-3 text-left">Exit Time</th>
                  <th className="px-3 py-3 text-left">Duration</th>
                  <th className="px-3 py-3 text-left rounded-tr-lg">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {report.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-2">📊</div>
                      No payments recorded for this date.
                    </td>
                  </tr>
                ) : report.map((row, i) => (
                  <tr key={row._id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3 font-semibold text-blue-700">{row.PlateNumber}</td>
                    <td className="px-3 py-3 text-xs">{formatDateTime(row.EntryTime)}</td>
                    <td className="px-3 py-3 text-xs">{formatDateTime(row.ExitTime)}</td>
                    <td className="px-3 py-3">{formatDuration(row.Duration)}</td>
                    <td className="px-3 py-3 font-bold text-green-700">{row.AmountPaid?.toLocaleString()} Rwf</td>
                  </tr>
                ))}
              </tbody>
              {report.length > 0 && (
                <tfoot>
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td colSpan={5} className="px-3 py-3 font-bold text-right text-gray-700">Total Revenue:</td>
                    <td className="px-3 py-3 font-bold text-green-700 text-base">{totalRevenue.toLocaleString()} Rwf</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
