import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/expenses';
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [editingId, setEditingId] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadSummary();
    loadCategoryTotals(startDateFilter, endDateFilter);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!form.date) {
      setError('Date is required');
      return;
    }

    if (form.date > new Date().toISOString().split('T')[0]) {
      setError('Date cannot be in the future');
      return;
    }

    setError('');

    const isEditing = editingId !== null;
    const url = isEditing
    ? `${API_URL}/${editingId}`
    : `${API_URL}`

    setSaving(true);

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
    .then(() => {
      setForm({ title: '', amount: '', category: '', date: ''})
      setEditingId(null);
      loadExpenses(categoryFilter, startDateFilter, endDateFilter);
      loadSummary(categoryFilter, startDateFilter, endDateFilter);
      loadCategoryTotals(startDateFilter, endDateFilter);
    })
    .catch(error => setError(error.message))
    .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    const confirmed = window.confirm('Delete this expense?');

    if (!confirmed) return;

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete expense');
      loadExpenses(categoryFilter, startDateFilter, endDateFilter);
      loadSummary(categoryFilter, startDateFilter, endDateFilter);
      loadCategoryTotals(startDateFilter, endDateFilter);
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
    ? `${API_URL}/summary?${query}`
    : `${API_URL}/summary`

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
     `${API_URL}?${query}`
    : `${API_URL}`

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
    loadCategoryTotals(startDateFilter, endDateFilter);
  }

  function clearFilter() {
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    loadExpenses();
    loadSummary();
    loadCategoryTotals();
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

  function loadCategoryTotals(startDate = '', endDate = '') {
    const params = new URLSearchParams();

    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }

    const query = params.toString();
    const url = query 
    ? `${API_URL}/summary/by-category?${query}` 
    : `${API_URL}/summary/by-category`

    fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load category totals')
      return response.json();
    })
    .then(data => setCategoryTotals(data))
    .catch(error => setError(error.message));

  }
  
  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>
      <h2>Total: {currencyFormatter.format(total)}</h2>
      <h3>By Category</h3>
      {Object.keys(categoryTotals).length === 0 ? (
        <p>No category totals yet.</p>
      ) : (
        <ul>
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <li key={category}>
            {category}: {currencyFormatter.format(amount)}
          </li>
        ))}
      </ul>
      )}
      
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

      <p>
        Showing:
        {categoryFilter ? ` category "${categoryFilter}"` : ' all categories'}
        {startDateFilter && endDateFilter ? ` from ${startDateFilter} to ${endDateFilter}` : ''}
      </p>

      <form onSubmit={handleSubmit}>
        <input name='title' value={form.title} onChange={handleChange} placeholder='Title' />
        <input name='amount' value={form.amount} onChange={handleChange} placeholder='Amount' type='number' step='0.01' />
        <input name='category' value={form.category} onChange={handleChange} placeholder='Category' />
        <input name='date' value={form.date} onChange={handleChange} type='date' max={new Date().toISOString().split('T')[0]} />
        <button type='submit' disabled={saving}>{saving ? 'Saving...' : editingId === null ? 'Add Expense' : 'Update Expense'}</button>
        {editingId !== null && (
          <button type='button' disabled={saving} onClick={cancelEdit}>Cancel</button>
        )}
      </form>

      {!loading && !error && (
        expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul>
          {expenses.map(expense => (
            <li key={expense.id}>
              {expense.title} - {currencyFormatter.format(expense.amount)} - {expense.category} - {expense.date}
              <button type='button' disabled={saving} onClick={() => handleDelete(expense.id)}>
                Delete
              </button>
              <button type='button' disabled={saving} onClick={() => startEdit(expense)}>Edit</button>
            </li>
          ))}
        </ul>
        )
      )}
     </main>
    </>
  )
}

export default App
