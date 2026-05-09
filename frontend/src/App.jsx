import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState('');

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

  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>

      {loading && <p>Loading expenses...</p>}
      {error && <p>{error}</p>}

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
