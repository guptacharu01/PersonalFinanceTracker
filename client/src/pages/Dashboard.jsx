import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { errorMessage } from '../api'
import { useAuth } from '../AuthContext.jsx'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const PIE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#65a30d']

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>
  if (error) return <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
  if (!data) return null

  const cards = [
    { label: 'Total income', value: data.totalIncome, color: 'text-green-700' },
    { label: 'Total expenses', value: data.totalExpense, color: 'text-red-700' },
    { label: 'Current balance', value: data.balance, color: data.balance >= 0 ? 'text-slate-900' : 'text-red-700' }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p className="mt-1 text-slate-500">Hello, {user.name} — here is an overview of your money.</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{inr.format(card.value)}</p>
          </div>
        ))}
      </div>

      {data.recentTransactions.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-center shadow">
          <p className="text-slate-600">No transactions yet.</p>
          <Link to="/transactions" className="mt-2 inline-block rounded bg-brand px-4 py-2 text-sm text-white">Add your first transaction</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="font-semibold">Expenses by category</h2>
              {data.categoryExpenses.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No expenses yet, so there is nothing to show here.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.categoryExpenses} dataKey="amount" nameKey="category" outerRadius={90} label>
                        {data.categoryExpenses.map((entry, i) => (
                          <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => inr.format(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="font-semibold">Monthly income vs expenses</h2>
              {data.monthly.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No monthly data yet.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => inr.format(value)} />
                      <Legend />
                      <Bar dataKey="income" fill="#16a34a" name="Income" />
                      <Bar dataKey="expense" fill="#dc2626" name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent transactions</h2>
              <Link to="/transactions" className="text-sm text-brand underline">View all</Link>
            </div>
            <ul className="mt-3 divide-y">
              {data.recentTransactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-slate-500">{t.category} · {t.date}</p>
                  </div>
                  <p className={`font-semibold ${t.type === 'INCOME' ? 'text-green-700' : 'text-red-700'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{inr.format(t.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
