import { useEffect, useState } from 'react'
import { getMonthlyReport } from '../api/axios'

export default function Reports() {
  const [report, setReport]   = useState([])
  const [month, setMonth]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const load = async (m) => {
    setLoading(true); setError('')
    try { const r = await getMonthlyReport(m); setReport(r.data) }
    catch { setError('Failed to load report.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load('') }, [])

  const onMonthChange = (e) => { setMonth(e.target.value); load(e.target.value) }

  const rwf = (n) => Number(n).toLocaleString() + ' RWF'

  const totalGross     = report.reduce((a, r) => a + r.grossSalary,    0)
  const totalDeduction = report.reduce((a, r) => a + r.totalDeduction, 0)
  const totalNet       = report.reduce((a, r) => a + r.netSalary,      0)

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly employee payroll report</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Month:</label>
            <input type="month" value={month} onChange={onMonthChange} className="input w-44" />
          </div>
          {month && (
            <button onClick={() => { setMonth(''); load('') }} className="btn-secondary">Show All</button>
          )}
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Printable area */}
      <div className="card overflow-hidden">

        {/* Report header */}
        <div className="bg-blue-800 text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">SmartPark — Employee Payroll Report</h2>
            <p className="text-blue-200 text-sm mt-0.5">Rubavu District · Western Province · Rwanda</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Period</p>
            <p className="text-white font-semibold text-lg">
              {month
                ? new Date(month + '-01').toLocaleDateString('en-RW', { month:'long', year:'numeric' })
                : 'All Records'}
            </p>
            <p className="text-blue-300 text-xs mt-0.5">
              Generated: {new Date().toLocaleDateString('en-RW', { day:'2-digit', month:'long', year:'numeric' })}
            </p>
          </div>
        </div>

        {/* Summary */}
        {report.length > 0 && (
          <div className="grid grid-cols-3 border-b border-gray-200">
            {[
              { label:'Total Employees', value: report.length,       color:'text-gray-800' },
              { label:'Total Gross',     value: rwf(totalGross),     color:'text-green-700' },
              { label:'Total Net Payable', value: rwf(totalNet),     color:'text-blue-700' },
            ].map((s, i) => (
              <div key={i} className={`px-6 py-4 text-center ${i < 2 ? 'border-r border-gray-200' : ''}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <div className="p-6"><div className="alert-error">⚠️ {error}</div></div>}

        {/* Table */}
        {loading
          ? <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-3" />
              Loading report…
            </div>
          : report.length === 0
            ? <div className="p-8 text-center text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p>{month ? 'No records for this month.' : 'No payroll records found.'}</p>
              </div>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['#','Emp No.','First Name','Last Name','Position','Department','Month','Gross Salary','Deduction','Net Salary'].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((rec, i) => (
                      <tr key={rec._id} className="tr">
                        <td className="td">{i + 1}</td>
                        <td className="td">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {rec.employee?.employeeNumber}
                          </span>
                        </td>
                        <td className="td font-medium">{rec.employee?.firstName}</td>
                        <td className="td font-medium">{rec.employee?.lastName}</td>
                        <td className="td">{rec.employee?.position}</td>
                        <td className="td">
                          <span className="badge bg-blue-100 text-blue-800">
                            {rec.employee?.department?.departmentName || '—'}
                          </span>
                        </td>
                        <td className="td font-medium">{rec.month}</td>
                        <td className="td text-green-700">{rwf(rec.grossSalary)}</td>
                        <td className="td text-red-600">-{rwf(rec.totalDeduction)}</td>
                        <td className="td font-bold text-blue-700">{rwf(rec.netSalary)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan="7" className="px-4 py-3 text-sm text-right text-gray-700">TOTALS:</td>
                      <td className="px-4 py-3 text-sm text-green-700">{rwf(totalGross)}</td>
                      <td className="px-4 py-3 text-sm text-red-600">-{rwf(totalDeduction)}</td>
                      <td className="px-4 py-3 text-sm text-blue-700 font-bold">{rwf(totalNet)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
        }

        {/* Footer */}
        {report.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>EPMS — SmartPark Payroll System v1.0</span>
            <span>Prepared by: HR Department · IMANIRIHO ALEX</span>
          </div>
        )}
      </div>
    </div>
  )
}
