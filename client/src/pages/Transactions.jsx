import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const inputClass = 'w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand'
const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Salary', 'Freelance', 'Other']

const emptyForm = { title: '', amount: '', type: 'EXPENSE', category: 'Food', date: '', notes: '' }

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [filters, setFilters] = useState({ type: '', category: '', date: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filters.type) params.type = filters.type
    if (filters.category) params.category = filters.category
    if (filters.date) params.date = filters.date
    api.get('/transactions', { params })
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(errorMessage(err, 'Could not load transactions.')))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { load() }, [load])

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMessage('')
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0 || !form.date) {
      setError('Please enter a title, an amount greater than 0, and a date.')
      return
    }
    setSaving(true)
    try {
      await api.post('/transactions', {
        title: form.title.trim(),
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes.trim() || null
      })
      setForm(emptyForm)
      setMessage('Transaction added.')
      load()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the transaction.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await api.delete(`/transactions/${id}`)
      setMessage('Transaction deleted.')
      load()
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the transaction.'))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Transactions</h1>

      {message && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-5 shadow">
        <h2 className="font-semibold">Add a transaction</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input value={form.title} onChange={(e) => updateForm('title', e.target.value)} className={inputClass} placeholder="e.g. Groceries" />
          </div>
          <div>
            <label className="text-sm font-medium">Amount</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => updateForm('amount', e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select value={form.type} onChange={(e) => updateForm('type', e.target.value)} className={inputClass}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select value={form.category} onChange={(e) => updateForm('category', e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <input value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} className={inputClass} placeholder="Anything to remember" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 rounded bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {saving ? 'Saving...' : 'Add transaction'}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-white p-5 shadow">
        <h2 className="font-semibold">Filters</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className={inputClass}>
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
        </div>
        {(filters.type || filters.category || filters.date) && (
          <button onClick={() => setFilters({ type: '', category: '', date: '' })} className="mt-3 text-sm text-brand underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-white p-5 shadow">
        <h2 className="font-semibold">Transaction history</h2>
        {loading ? (
          <p className="mt-3 text-slate-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="mt-3 text-slate-500">No transactions found. Add one above, or clear your filters.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {transactions.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-slate-500">{t.category} · {t.date}{t.notes ? ` · ${t.notes}` : ''}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-semibold ${t.type === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{inr.format(t.amount)}
                  </p>
                  <button onClick={() => handleDelete(t.id)} className="rounded border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
