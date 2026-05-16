const API_URL = 'http://localhost:8080/api/expenses';

function handleJsonResponse(response, errorMessage) {
    if (!response.ok) throw new Error(errorMessage);
    return response.json();
}

function handleEmptyResponse(response, errorMessage) {
    if (!response.ok) throw new Error(errorMessage);
}

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
        handleJsonResponse(response, 'Failed to load expenses');
    })
}

export function fetchSummary(filters = {}) {
    return fetch(`${API_URL}/summary${buildQuery(filters)}`).then(response => {
        handleJsonResponse(response, 'Failed to load expenses');
    })
}

export function fetchCategoryTotals({ startDate = '', endDate = '' } = {}) {
    return fetch(`${API_URL}/summary/by-category${buildQuery({ startDate, endDate })}`).then(response => {
        handleJsonResponse(response, 'Failed to load expenses');
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
        handleJsonResponse(response, 'Failed to load expenses');
    })
}

export function updateExpense(id, expense) {
    return fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
    }).then(response => {
        handleJsonResponse(response, 'Failed to load expenses');
    })
}

export function deleteExpense(id) {
    return fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    }).then(response => {
        handleEmptyResponse(response, 'Failed to delete expense');
    })
}

