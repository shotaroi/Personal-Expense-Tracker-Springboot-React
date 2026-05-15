function ExpenseList({
    expenses,
    currencyFormatter,
    saving,
    handleDelete,
    startEdit,
    deletingId,
}) {
    if (expenses.length === 0) return <p>No expenses yet.</p>

    return (
        <ul className="expense-list">
            {expenses.map(expense => (
                <li key={expense.id}>
                    <span>
                        {expense.title} - {currencyFormatter.format(expense.amount)} - {expense.category} - {expense.date}
                    </span>

                    <span className="expense-actions">
                        <button 
                          type="button" 
                          disabled={saving || deletingId === expense.id}
                          onClick={() => handleDelete(expense.id)}
                        >
                            {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button 
                          type="button"
                          disabled={saving || deletingId === expense.id}
                          onClick={() => startEdit(expense)}
                        >
                            Edit
                        </button>
                    </span>
                </li>
            ))}
        </ul>
    )
}

export default ExpenseList;