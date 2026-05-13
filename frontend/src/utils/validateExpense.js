export function validateExpense(expense) {
    if (!expense.title.trim()) return 'Title is required';
    if (!expense.amount || Number(expense.amount) <= 0) return 'Amount must be greater than 0';
    if (!expense.date) return 'Date is required';
    if (expense.date > new Date().toISOString().split('T')[0]) return 'Date cannot be in the future';
    return '';
}