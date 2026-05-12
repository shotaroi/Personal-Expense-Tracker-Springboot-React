import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
  })

  useEffect(() => {
    fetch("http://localhost:8080/api/expenses")
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load expenses");
      }
      return response.json();
    })
    .then(data => setExpenses(data))
    .catch(error => setError(error.message))
    .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch('http://localhost:8080/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      return response.json();
    })
    .then(newExpenses => {
      setExpenses([...expenses, newExpenses]);
      setForm({ title: '', amount: '', category: '', date: ''})
    })
    .catch(error => setError(error.message))
  }

  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>

      {loading && <p>Loading expenses...</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name='title' value={form.title} onChange={handleChange} placeholder='Title' />
        <input name='amount' value={form.amount} onChange={handleChange} placeholder='Amount' type='number' step='0.01' />
        <input name='category' value={form.category} onChange={handleChange} placeholder='Category' />
        <input name='date' value={form.date} onChange={handleChange} type='date' />
        <button type='submit'>Add Expense</button>
      </form>

      {!loading && !error && (
        <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.title} - ${expense.amount} - {expense.category}
          </li>
        ))}
      </ul>
      )}
     </main>
    </>
  )
}

export default App
