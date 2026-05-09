import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/expenses")
    .then(response => response.json())
    .then(data => setExpenses(data));
  }, []);

  return (
    <>
     <main>
      <h1>Personal Expense Tracker</h1>

      <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.title} - ${expense.amount} - {expense.category}
          </li>
        ))}
      </ul>
     </main>
    </>
  )
}

export default App
