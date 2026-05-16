export function sortExpensesByDate(expenses, direction = 'desc') {
    return [...expenses].sort((a, b) => {
        if (direction === 'asc') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
    });
}
