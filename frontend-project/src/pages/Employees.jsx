import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, getDepartments } from '../api/axios'

const EMPTY = {
  employeeNumber:'', firstName:'', lastName:'', position:'',
  address:'', telephone:'', gender:'', hiredDate:'', department:''
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [depts, setDepts]         = useState([])
  const [form, setForm]           = useState(EMPTY)
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [search, setSearch]       = useState('')

  const load = async () => {
    try {
      const [e, d] = await Promise.all([getEmployees(), getDepartments()])
      setEmployees(e.data); setDepts(d.data)
    } catch { setError('Failed to load data.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    const required = Object.keys(EMPTY)
    if (required.some(k => !form[k])) { setError('All fields are required.'); return }
    setBusy(true); setError('')
    try {
      await createEmployee(form)
      setSuccess('Employee added successfully.')
      setForm(EMPTY); load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.')
    } finally { setBusy(false) }
  }

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase()
    return (
      emp.firstName?.toLowerCase().includes(q) ||
      emp.lastName?.toLowerCase().includes(q)  ||
      emp.employeeNumber?.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q)  ||
      emp.department?.departmentName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage SmartPark employee records</p>
        </div>
        <span className="badge bg-blue-100 text-blue-800">{employees.length} employees</span>
      </div>

      {/* ── Form ── */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">➕ Add New Employee</h2>
        {error   && <div className="alert-error   mb-4">⚠️ {error}</div>}
        {success && <div className="alert-success mb-4">✅ {success}</div>}

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Employee Number *</label>
            <input name="employeeNumber" value={form.employeeNumber} onChange={onChange}
              className="input" placeholder="EMP001" required />
          </div>
          <div>
            <label className="label">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={onChange}
              className="input" placeholder="First name" required />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={onChange}
              className="input" placeholder="Last name" required />
          </div>
          <div>
            <label className="label">Position *</label>
            <input name="position" value={form.position} onChange={onChange}
              className="input" placeholder="e.g. Mechanic" required />
          </div>
          <div>
            <label className="label">Address *</label>
            <input name="address" value={form.address} onChange={onChange}
              className="input" placeholder="e.g. Rubavu, Rwanda" required />
          </div>
          <div>
            <label className="label">Telephone *</label>
            <input name="telephone" value={form.telephone} onChange={onChange}
              className="input" placeholder="0788000000" required />
          </div>
          <div>
            <label className="label">Gender *</label>
            <select name="gender" value={form.gender} onChange={onChange} className="input" required>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Hired Date *</label>
            <input type="date" name="hiredDate" value={form.hiredDate} onChange={onChange}
              className="input" required />
          </div>
          <div>
            <label className="label">Department *</label>
            <select name="department" value={form.department} onChange={onChange} className="input" required>
              <option value="">Select department</option>
              {depts.map(d => (
                <option key={d._id} value={d._id}>{d.departmentCode} – {d.departmentName}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Adding…' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">All Employees</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input w-60" placeholder="Search employees…" />
        </div>
        {loading
          ? <p className="p-8 text-center text-gray-400">Loading…</p>
          : filtered.length === 0
            ? <div className="p-8 text-center text-gray-400">
                <p className="text-4xl mb-2">👥</p>
                <p>{search ? 'No match found.' : 'No employees yet.'}</p>
              </div>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['#','Emp No.','Full Name','Position','Department','Gender','Telephone','Hired Date','Address'].map(h => (
                        <th key={h} className="th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp, i) => (
                      <tr key={emp._id} className="tr">
                        <td className="td">{i + 1}</td>
                        <td className="td"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{emp.employeeNumber}</span></td>
                        <td className="td font-medium">{emp.firstName} {emp.lastName}</td>
                        <td className="td">{emp.position}</td>
                        <td className="td">
                          <span className="badge bg-blue-100 text-blue-800">{emp.department?.departmentName || '—'}</span>
                        </td>
                        <td className="td">
                          <span className={`badge ${emp.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {emp.gender}
                          </span>
                        </td>
                        <td className="td">{emp.telephone}</td>
                        <td className="td">{new Date(emp.hiredDate).toLocaleDateString()}</td>
                        <td className="td">{emp.address}</td>
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
