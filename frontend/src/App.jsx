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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const[editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault();

    const isEditing = editingId !== null;
    const url = isEditing
    ? `http://localhost:8080/api/expenses/${editingId}`
    : 'http://localhost:8080/api/expenses'

    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    })
    .then((response) => {
      if (!response.ok) throw new Error(isEditing ? 'Failed to update expense' :'Failed to create expense'); 
      return response.json();
    })
    .then(newExpenses => {
      setForm({ title: '', amount: '', category: '', date: ''})
      setEditingId(null);
      loadExpenses(categoryFilter, startDateFilter, endDateFilter);
      loadSummary(categoryFilter, startDateFilter, endDateFilter);
    })
    .catch(error => setError(error.message))
  }

  function handleDelete(id) {
    fetch(`http://localhost:8080/api/expenses/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete expense');
      loadExpenses(categoryFilter, startDateFilter, endDateFilter);
      loadSummary(categoryFilter, startDateFilter, endDateFilter);
    })
    .catch(error => setError(error.message))
  }

  function loadSummary(category = '', startDate = '', endDate = '') {
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }

    const query = params.toString();
    const url = query 
    ? `http://localhost:8080/api/expenses/summary?${query}`
    : 'http://localhost:8080/api/expenses/summary'

    fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load summary');
      return response.json();
    })
    .then(data => setTotal(data.total))
    .catch(error => setError(error.message));
  }

  function loadExpenses(category = '', startDate = '', endDate = '') {
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate)
    }

    const query = params.toString();
    const url = query ?
     `http://localhost:8080/api/expenses?${query}`
    : 'http://localhost:8080/api/expenses'

    setLoading(true);

    fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load expenses');
      return response.json();
    })
    .then(data => setExpenses(data))
    .catch(error => setError(error.message))
    .finally(() => setLoading(false))
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadExpenses(categoryFilter, startDateFilter, endDateFilter);
    loadSummary(categoryFilter, startDateFilter, endDateFilter);
  }

  function clearFilter() {
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    loadExpenses();
    loadSummary();
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', amount: '', category: '', date: ''});
  }
  
  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>
      <h2>Total: ${total}</h2>

      {loading && <p>Loading expenses...</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleFilterSubmit}>
        <input 
          value={categoryFilter}
          onChange={event => setCategoryFilter(event.target.value)}
          placeholder='Filter by category'
        />
        <input type="date" value={startDateFilter} onChange={event => setStartDateFilter(event.target.value)} />
        <input type="date" value={endDateFilter} onChange={event => setEndDateFilter(event.target.value)} />
        <button type='submit'>Filter</button>
        <button type='button' onClick={clearFilter}>Clear</button>
      </form>

      <form onSubmit={handleSubmit}>
        <input name='title' value={form.title} onChange={handleChange} placeholder='Title' />
        <input name='amount' value={form.amount} onChange={handleChange} placeholder='Amount' type='number' step='0.01' />
        <input name='category' value={form.category} onChange={handleChange} placeholder='Category' />
        <input name='date' value={form.date} onChange={handleChange} type='date' />
        <button type='submit'>{editingId === null ? 'Add Expense' : 'Update Expense'}</button>
        {editingId !== null && (
          <button type='button' onClick={cancelEdit}>Cancel</button>
        )}
      </form>

      {!loading && !error && (
        <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.title} - ${expense.amount} - {expense.category}
            <button type='button' onClick={() => handleDelete(expense.id)}>
              Delete
            </button>
            <button type='button' onClick={() => startEdit(expense)}>Edit</button>
          </li>
        ))}
      </ul>
      )}
     </main>
    </>
  )
}

export default App
