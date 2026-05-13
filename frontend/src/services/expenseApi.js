const API_URL = 'http://localhost:8080/api/expenses';

function buildQuery({ category = '', startDate = '', endDate = '' } = {}) {
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
}

export function fetchExpenses(filters = {}) {
    return fetch(`${API_URL}${buildQuery(filters)}`).then(response => {
        if (!response.ok) throw new Error('Failed to load expenses');
        return response.json();
    })
}

export function fetchSummary(filters = {}) {
    return fetch(`${API_URL}/summary${buildQuery(filters)}`).then(response => {
        if (!response.ok) throw new Error('Failed to load summary');
        return response.json();
    })
}

export function fetchCategoryTotals({ startDate = '', endDate = '' } = {}) {
    return fetch(`${API_URL}/summary/by-category${buildQuery({ startDate, endDate })}`).then(response => {
        if (!response.ok) throw new Error('Failed to load category totals');
        return response.json();
    })
}

export function createExpense(expense) {
    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
    }).then(response => {
        if (!response.ok) throw new Error('Failed to create expense');
        return response.json();
    })
}

export function updateExpense(id, expense) {
    return fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        header: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
    }).then(response => {
        if (!response.ok) throw new Error('Failed to update expense');
        return response.json();
    })
}

export function deleteExpense(id) {
    return fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    }).then(response => {
        if (!response.ok) throw new Error('Failed to delete expense');
    })
}

