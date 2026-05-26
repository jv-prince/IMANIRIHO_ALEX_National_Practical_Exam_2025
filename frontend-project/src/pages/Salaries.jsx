import { useEffect, useState } from 'react'
import { getSalaries, createSalary, updateSalary, deleteSalary, getEmployees } from '../api/axios'

export default function Salaries() {
  const [salaries, setSalaries]   = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm]           = useState({ employee:'', month:'' })
  const [editId, setEditId]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [filterMonth, setFilter]  = useState('')

  const load = async () => {
    try {
      const [s, e] = await Promise.all([getSalaries(), getEmployees()])
      setSalaries(s.data); setEmployees(e.data)
    } catch { setError('Failed to load data.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee || !form.month) { setError('Employee and month are required.'); return }
    setBusy(true); setError('')
    try {
      if (editId) { await updateSalary(editId, form); setSuccess('Salary record updated.') }
      else        { await createSalary(form);         setSuccess('Salary record created.') }
      setForm({ employee:'', month:'' }); setEditId(null); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.')
    } finally { setBusy(false) }
  }

  const onEdit = (s) => {
    setForm({ employee: s.employee?._id || '', month: s.month })
    setEditId(s._id); setError('')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this salary record permanently?')) return
    try { await deleteSalary(id); setSuccess('Deleted.'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.') }
  }

  const rwf = (n) => Number(n).toLocaleString() + ' RWF'
  const filtered = filterMonth ? salaries.filter(s => s.month === filterMonth) : salaries

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
          <p className="text-gray-500 text-sm mt-1">Process and manage employee payroll records</p>
        </div>
        <span className="badge bg-blue-100 text-blue-800">{salaries.length} records</span>
      </div>

      {/* ── Form ── */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {editId ? '✏️ Edit Salary Record' : '💰 Process Salary'}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Gross salary and deductions are auto-calculated from the employee's department.
        </p>
        {error   && <div className="alert-error   mb-4">⚠️ {error}</div>}
        {success && <div className="alert-success mb-4">✅ {success}</div>}

        <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Employee *</label>
            <select name="employee" value={form.employee} onChange={onChange} className="input" required>
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.employeeNumber} – {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Month *</label>
            <input type="month" name="month" value={form.month} onChange={onChange}
              className="input" required />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Processing…' : editId ? 'Update' : 'Process Salary'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm({ employee:'', month:'' }); setEditId(null); setError('') }}
                className="btn-secondary">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Salary Records</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Filter by month:</label>
            <input type="month" value={filterMonth} onChange={e => setFilter(e.target.value)} className="input w-44" />
            {filterMonth && (
              <button onClick={() => setFilter('')} className="text-sm text-blue-600 hover:underline">Clear</button>
            )}
          </div>
        </div>

        {loading
          ? <p className="p-8 text-center text-gray-400">Loading…</p>
          : filtered.length === 0
            ? <div className="p-8 text-center text-gray-400">
                <p className="text-4xl mb-2">💰</p>
                <p>{filterMonth ? 'No records for this month.' : 'No salary records yet.'}</p>
              </div>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['#','Employee','Department','Month','Gross Salary','Deduction','Net Salary','Actions'].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s._id} className="tr">
                        <td className="td">{i + 1}</td>
                        <td className="td">
                          <p className="font-medium">{s.employee?.firstName} {s.employee?.lastName}</p>
                          <p className="text-xs text-gray-400">{s.employee?.employeeNumber}</p>
                        </td>
                        <td className="td">
                          <span className="badge bg-blue-100 text-blue-800">
                            {s.employee?.department?.departmentName || '—'}
                          </span>
                        </td>
                        <td className="td font-medium">{s.month}</td>
                        <td className="td text-green-700">{rwf(s.grossSalary)}</td>
                        <td className="td text-red-600">-{rwf(s.totalDeduction)}</td>
                        <td className="td font-bold text-blue-700">{rwf(s.netSalary)}</td>
                        <td className="td">
                          <div className="flex gap-2">
                            <button onClick={() => onEdit(s)} className="btn btn-warning btn-sm">Edit</button>
                            <button onClick={() => onDelete(s._id)} className="btn btn-danger btn-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan="6" className="px-4 py-3 text-sm text-right text-gray-700">Total Net Salary:</td>
                      <td className="px-4 py-3 text-sm text-blue-700 font-bold">
                        {rwf(filtered.reduce((a, s) => a + s.netSalary, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
        }
      </div>
    </div>
  )
}
