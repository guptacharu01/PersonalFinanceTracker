import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const inputClass = 'w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function Budget() {
  const [month, setMonth] = useState(currentMonth())
  const [amount, setAmount] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/budgets', { params: { month } })
      .then((res) => {
        setData(res.data)
        setAmount(res.data.budgetAmount != null ? String(res.data.budgetAmount) : '')
      })
      .catch((err) => setError(errorMessage(err, 'Could not load the budget.')))
      .finally(() => setLoading(false))
  }, [month])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setMessage('')
    if (!amount || Number(amount) <= 0) { setError('Please enter a budget amount greater than 0.'); return }
    setSaving(true)
    try {
      await api.post('/budgets', { month, amount: Number(amount) })
      setMessage('Budget saved.')
      load()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the budget.'))
    } finally {
      setSaving(false)
    }
  }

  const percent = data && data.budgetAmount ? Math.min(100, (data.spent / data.budgetAmount) * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold">Monthly budget</h1>
      <p className="mt-1 text-slate-500">Set a spending limit for a month and see how much of it you have used.</p>

      {message && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-5 shadow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium">Budget amount</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="0.00" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 rounded bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {saving ? 'Saving...' : 'Save budget'}
        </button>
      </form>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading budget...</p>
      ) : data && (
        <div className="mt-6 rounded-lg bg-white p-5 shadow">
          <h2 className="font-semibold">Budget for {data.month}</h2>
          {data.budgetAmount == null ? (
            <p className="mt-3 text-slate-500">
              No budget set for this month yet. Expenses so far: {inr.format(data.spent)}.
              Set a budget above to track the remaining amount.
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><p className="text-sm text-slate-500">Budget</p><p className="text-xl font-bold">{inr.format(data.budgetAmount)}</p></div>
                <div><p className="text-sm text-slate-500">Spent</p><p className="text-xl font-bold text-red-700">{inr.format(data.spent)}</p></div>
                <div><p className="text-sm text-slate-500">Remaining</p><p className={`text-xl font-bold ${data.remaining < 0 ? 'text-red-700' : 'text-green-700'}`}>{inr.format(data.remaining)}</p></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded bg-slate-200">
                <div className={`h-full ${data.overBudget ? 'bg-red-600' : 'bg-brand'}`} style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{percent.toFixed(0)}% of the budget used</p>
              {data.overBudget && (
                <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  Warning: your expenses have reached or exceeded this month&apos;s budget.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
