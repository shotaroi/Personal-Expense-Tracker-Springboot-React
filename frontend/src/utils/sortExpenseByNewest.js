export function sortExpenseByNewest(expenses) {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}