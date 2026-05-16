export function sortExpensesByNewest(expenses) {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}