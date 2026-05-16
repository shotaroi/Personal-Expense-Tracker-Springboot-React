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
import { sortExpensesByDate } from './utils/sortExpensesByDate';

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
  const [sortDirection, setSortDirection] = useState('desc');

  const expenseCountLabel = `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}`;
  const sortDirectionLabel = sortDirection === 'desc' ? 'Newest first' : 'oldest first'
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

  useEffect(() => {
    setExpenses((prev) => sortExpensesByDate(prev, sortDirection));
  }, [sortDirection]);

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
      setExpenses(sortExpensesByDate(data, sortDirection));
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

  function toggleSortDirection() {
    setSortDirection((currentDirection) => 
      currentDirection === 'desc' ? 'asc' : 'desc'
    );
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

        <>
          <p>
            Showing {expenseCountLabel}
          </p>
          <button 
            type='button'
            aria-label="Toggle expense sort direction"
            aria-pressed={sortDirection === 'asc'}
            onClick={toggleSortDirection}
          >
            Sort: {sortDirectionLabel}
          </button>
          <ExpenseList 
            expenses={expenses}
            currencyFormatter={currencyFormatter}
            saving={saving}
            handleDelete={handleDelete}
            startEdit={startEdit}
            deletingId={deletingId}
          />
        </>
        
      )}
     </main>
    </>
  )
}

export default App
