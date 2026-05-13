import { useEffect, useState } from 'react'
import './App.css'
import Summary from './components/Summary';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseForm from './components/ExpenseForm';

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
     <main className='app'>
      <h1>Personal Expense Tracker</h1>
      <Summary 
        total={total}
        categoryTotals={categoryTotals}
        currencyFormatter={currencyFormatter}
      />

      {loading && <p>Loading expenses...</p>}
      {error && <p className='error'>{error}</p>}

      <ExpenseFilters 
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDateFilter={startDateFilter}
        setStartDateFilter={setStartDateFilter}
        endDateFilter={endDateFilter}
        setEndDateFilter={setEndDateFilter}
        handleFilterSubmit={handleFilterSubmit}
        clearFilter={clearFilter}
      />

      <ExpenseForm 
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        editingId={editingId}
        saving={saving}
        cancelEdit={cancelEdit}
      />

      {!loading && !error && (
        expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className='expense-list'>
          {expenses.map(expense => (
            <li key={expense.id}>
              <span>
                {expense.title} - {currencyFormatter.format(expense.amount)} - {expense.category} - {expense.date}
              </span>

              <span className='expense-actions'>
                <button type='button' disabled={saving} onClick={() => handleDelete(expense.id)}>
                  Delete
                </button>
                <button type='button' disabled={saving} onClick={() => startEdit(expense)}>
                  Edit
                </button>
              </span>  
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
