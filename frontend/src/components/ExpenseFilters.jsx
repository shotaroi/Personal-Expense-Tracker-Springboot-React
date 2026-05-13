function ExpenseFilters({
    categoryFilter,
    setCategoryFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    handleFilterSubmit,
    clearFilter,
}) {
    return (
        <>
          <form className="filter-form" onSubmit={handleFilterSubmit}>
            <input 
              value={categoryFilter}
              onChange={event => setCategoryFilter(event.target.value)}
              placeholder="Filter by category"
            />
            <input type="date" value={startDateFilter} onChange={event => setStartDateFilter(event.target.value)} />
            <input type="date" value={endDateFilter} onChange={event => setEndDateFilter(event.target.value)} />
            <button type="submit">Filter</button>
            <button type="button" onClick={clearFilter}>Clear</button>
          </form>

          <p>
            Showing:
            {categoryFilter ? ` category "${categoryFilter}"` : ' all categories'}
            {startDateFilter && endDateFilter ? ` from ${startDateFilter} to ${endDateFilter}` : ''}
          </p>
        </>
    )
}

export default Expensefilters;