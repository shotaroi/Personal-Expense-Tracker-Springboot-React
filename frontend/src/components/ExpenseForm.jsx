function ExpenseForm({
    form,
    handleChange,
    handleSubmit,
    editingId,
    saving,
    cancelEdit,
}) {
    return (
        <form className="expense-form" onChange={handleSubmit}>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
            <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" type="number" step='0.01' />
            <input name="category" value={form.category} onChange={handleChange} placeholder="category"/>
            <input name="date" value={form.date} onChange={handleChange} type="date" max={new Date().toISOString().split('T')[0]}/>

            <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId === null ? 'Add Expense' : 'Update Expense'}
            </button>

            {editingId !== null && (
                <button type="button" disabled={saving} onClick={cancelEdit}>
                    Cancel
                </button>
            )}
        </form>
    )
}

export default ExpenseForm;