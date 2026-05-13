import { useEffect, useState } from 'react'
import './App.css'
import Summary from './components/Summary';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import { fetchExpenses, fetchSummary, fetchCategoryTotals, createExpense, updateExpense, deleteExpense, } from './services/expenseApi';

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

    setSaving(true);

    const expensePayload = {
      ...form,
      amount: Number(form.amount),
    }

    const request = isEditing
    ? updateExpense(editingId, expensePayload)
    : createExpense(expensePayload);

    request
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

    deleteExpense(id)
    .then(() => {
      loadExpenses(categoryFilter, startDateFilter, endDateFilter);
      loadSummary(categoryFilter, startDateFilter, endDateFilter);
      loadCategoryTotals(startDateFilter, endDateFilter);
    })
    .catch(error => setError(error.message))
  }

  function loadSummary(category = '', startDate = '', endDate = '') {
    fetchSummary({ category, startDate, endDate })
    .then(data => setTotal(data.total))
    .catch(error => setError(error.message));
  }

  function loadExpenses(category = '', startDate = '', endDate = '') {
    setLoading(true);

    fetchExpenses({ category, startDate, endDate })
    .then(data => setExpenses(data))
    .catch(error => setError(error.message))
    .finally(() => setLoading(false))
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    refereshData(categoryFilter, startDateFilter, endDateFilter);
  }

  function clearFilter() {
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    refereshData('', '', '');
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
    fetchCategoryTotals({ startDate, endDate })
    .then(data => setCategoryTotals(data))
    .catch(error => setError(error.message));
  }

  function refereshData(category = categoryFilter, startDate = startDateFilter, endDate = endDateFilter) {
    loadExpenses(categoryFilter, startDateFilter, endDateFilter);
    loadSummary(categoryFilter, startDateFilter, endDateFilter);
    loadCategoryTotals(startDateFilter, endDateFilter);
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
        <ExpenseList 
          expenses={expenses}
          currencyFormatter={currencyFormatter}
          saving={saving}
          handleDelete={handleDelete}
          startEdit={startEdit}
        />
      )}
     </main>
    </>
  )
}

export default App
