import { useEffect, useState } from 'react'

import { 
  fetchExpenses, 
  fetchSummary,
  fetchCategoryTotals, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
} from './services/expenseApi';
import { EMPTY_FORM } from './constants/expenseForm';
import { validateExpense } from './utils/validateExpense';
import { currencyFormatter } from './utils/currencyFormatter';
import { sortExpensesByNewest } from './utils/sortExpensesByNewest';

import Summary from './components/Summary';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Notifications from './components/Notifications';

import './App.css'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!message) return;
    
    const timeoutId = setTimeout(() => {
      setMessage('');
    }, 3000)

    return () => clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    refreshData('', '', '');
  }, []);

  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }
  
  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateExpense(form);

    if (validationError) {
      setMessage('');
      setError(validationError);
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
      setError('');
      setMessage(isEditing ? 'Expense updated successfully' : 'Expense added successfully');
      setForm(EMPTY_FORM)
      setEditingId(null);
      refreshData();
    })
    .catch(error => {
      setMessage('');
      setError(error.message)
    })
    .finally(() => setSaving(false));
  }

  function handleDelete(id) {
    const confirmed = window.confirm('Delete this expense?');
    
    if (!confirmed) return;
    
    setDeletingId(id);

    deleteExpense(id)
    .then(() => {
      setError('');
      setMessage('Expense deleted successfully');
      refreshData();
    })
    .catch(error => {
      setMessage('')
      setError(error.message)
    })
    .finally(() => setDeletingId(null));
  }

  function loadSummary(category = '', startDate = '', endDate = '') {
    fetchSummary({ category, startDate, endDate })
    .then(data => setTotal(data.total))
    .catch(error => setError(error.message));
  }

  function loadExpenses(category = '', startDate = '', endDate = '') {
    setLoading(true);

    fetchExpenses({ category, startDate, endDate })
    .then(data => {
      setExpenses(sortExpensesByNewest(data));
    })
    .catch(error => setError(error.message))
    .finally(() => setLoading(false))
  }

  function handleFilterSubmit(event) {
    event.preventDefault();
    refreshData(categoryFilter, startDateFilter, endDateFilter);
  }

  function clearFilter() {
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    refreshData('', '', '');
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
    setForm(EMPTY_FORM);
  }

  function loadCategoryTotals(startDate = '', endDate = '') {
    fetchCategoryTotals({ startDate, endDate })
    .then(data => setCategoryTotals(data))
    .catch(error => setError(error.message));
  }

  function refreshData(category = categoryFilter, startDate = startDateFilter, endDate = endDateFilter) {
    loadExpenses(category, startDate, endDate);
    loadSummary(category, startDate, endDate);
    loadCategoryTotals(startDate, endDate);
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
      <Notifications error={error} message={message} />
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
          deletingId={deletingId}
        />
      )}
     </main>
    </>
  )
}

export default App
