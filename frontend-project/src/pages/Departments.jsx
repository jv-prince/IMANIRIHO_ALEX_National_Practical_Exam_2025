import { useEffect, useState } from 'react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/axios'

const EMPTY = { departmentCode:'', departmentName:'', grossSalary:'', totalDeduction:'' }

export default function Departments() {
  const [depts, setDepts]     = useState([])
  const [form, setForm]       = useState(EMPTY)
  const [editId, setEditId]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try { const r = await getDepartments(); setDepts(r.data) }
    catch { setError('Failed to load departments.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.departmentCode || !form.departmentName || !form.grossSalary) {
      setError('Code, Name and Gross Salary are required.'); return
    }
    setBusy(true); setError('')
    try {
      if (editId) { await updateDepartment(editId, form); setSuccess('Department updated.') }
      else        { await createDepartment(form);         setSuccess('Department added.') }
      setForm(EMPTY); setEditId(null); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.')
    } finally { setBusy(false) }
  }

  const onEdit = (d) => {
    setForm({ departmentCode: d.departmentCode, departmentName: d.departmentName,
              grossSalary: d.grossSalary, totalDeduction: d.totalDeduction })
    setEditId(d._id); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    try { await deleteDepartment(id); setSuccess('Deleted.'); load(); setTimeout(() => setSuccess(''), 3000) }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.') }
  }

  const rwf = (n) => Number(n).toLocaleString() + ' RWF'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage departments and salary scales</p>
        </div>
        <span className="badge bg-blue-100 text-blue-800">{depts.length} departments</span>
      </div>

      {/* ── Form ── */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editId ? '✏️ Edit Department' : '➕ Add Department'}
        </h2>
        {error   && <div className="alert-error   mb-4">⚠️ {error}</div>}
        {success && <div className="alert-success mb-4">✅ {success}</div>}

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Department Code *</label>
            <input name="departmentCode" value={form.departmentCode} onChange={onChange}
              className="input uppercase" placeholder="e.g. CW" required />
          </div>
          <div>
            <label className="label">Department Name *</label>
            <input name="departmentName" value={form.departmentName} onChange={onChange}
              className="input" placeholder="e.g. Carwash" required />
          </div>
          <div>
            <label className="label">Gross Salary (RWF) *</label>
            <input type="number" name="grossSalary" value={form.grossSalary} onChange={onChange}
              className="input" placeholder="300000" min="0" required />
          </div>
          <div>
            <label className="label">Total Deduction (RWF)</label>
            <input type="number" name="totalDeduction" value={form.totalDeduction} onChange={onChange}
              className="input" placeholder="20000" min="0" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving…' : editId ? 'Update Department' : 'Add Department'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); setError('') }}
                className="btn-secondary">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">All Departments</h2>
        </div>
        {loading
          ? <p className="p-8 text-center text-gray-400">Loading…</p>
          : depts.length === 0
            ? <div className="p-8 text-center text-gray-400"><p className="text-4xl mb-2">🏢</p><p>No departments yet.</p></div>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['#','Code','Department Name','Gross Salary','Deduction','Net Salary','Actions'].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {depts.map((d, i) => (
                      <tr key={d._id} className="tr">
                        <td className="td">{i + 1}</td>
                        <td className="td">
                          <span className="badge bg-blue-100 text-blue-800 font-mono">{d.departmentCode}</span>
                        </td>
                        <td className="td font-medium">{d.departmentName}</td>
                        <td className="td text-green-700 font-medium">{rwf(d.grossSalary)}</td>
                        <td className="td text-red-600">{rwf(d.totalDeduction)}</td>
                        <td className="td text-blue-700 font-bold">{rwf(d.grossSalary - d.totalDeduction)}</td>
                        <td className="td">
                          <div className="flex gap-2">
                            <button onClick={() => onEdit(d)}
                              className="btn btn-warning btn-sm">Edit</button>
                            <button onClick={() => onDelete(d._id)}
                              className="btn btn-danger btn-sm">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>
    </div>
  )
}
