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
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8080/api/expenses")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load expenses");
      return response.json();
    })
    .then(data => setExpenses(data))
    .catch(error => setError(error.message))
    .finally(() => setLoading(false));

    loadSummary();
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
      if (!response.ok) throw new Error('Failed to create expense'); 
      return response.json();
    })
    .then(newExpenses => {
      setExpenses([...expenses, newExpenses]);
      setForm({ title: '', amount: '', category: '', date: ''})
      loadSummary();
    })
    .catch(error => setError(error.message))
  }

  function handleDelete(id) {
    fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete expense');
      setExpenses(expenses.filter(expense => expense.id !== id));
      loadSummary();
    })
    .catch(error => setError(error.message))
  }

  function loadSummary() {
    fetch('http://localhost:8080/api/expenses/summary')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load summary');
      return response.json();
    })
    .then(data => setTotal(data.total))
    .catch(error => setError(error.message));
 }
  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>
      <h2>Total: ${total}</h2>

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
            <button type='button' onClick={() => handleDelete(expense.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      )}
     </main>
    </>
  )
}

export default App
