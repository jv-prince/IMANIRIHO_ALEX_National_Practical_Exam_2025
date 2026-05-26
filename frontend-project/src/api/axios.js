import axios from 'axios'

// With Vite proxy, /api/* is forwarded to http://localhost:5000
const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Auth ──────────────────────────────────────────────
export const loginAPI      = (data) => API.post('/auth/login', data)
export const logoutAPI     = ()     => API.post('/auth/logout')
export const getMeAPI      = ()     => API.get('/auth/me')
export const registerAPI   = (data) => API.post('/auth/register', data)

// ── Departments ───────────────────────────────────────
export const getDepartments    = ()       => API.get('/departments')
export const createDepartment  = (data)   => API.post('/departments', data)
export const updateDepartment  = (id, d)  => API.put(`/departments/${id}`, d)
export const deleteDepartment  = (id)     => API.delete(`/departments/${id}`)

// ── Employees ─────────────────────────────────────────
export const getEmployees   = ()       => API.get('/employees')
export const createEmployee = (data)   => API.post('/employees', data)
export const updateEmployee = (id, d)  => API.put(`/employees/${id}`, d)
export const deleteEmployee = (id)     => API.delete(`/employees/${id}`)

// ── Salaries ──────────────────────────────────────────
export const getSalaries        = ()       => API.get('/salaries')
export const createSalary       = (data)   => API.post('/salaries', data)
export const updateSalary       = (id, d)  => API.put(`/salaries/${id}`, d)
export const deleteSalary       = (id)     => API.delete(`/salaries/${id}`)
export const getMonthlyReport   = (month)  =>
  API.get(`/salaries/report/monthly${month ? `?month=${month}` : ''}`)

export default API
