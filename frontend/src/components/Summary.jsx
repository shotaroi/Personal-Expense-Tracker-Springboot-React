function Summary({ total, categoryTotals, currencyFormatter}) {
    return (
        <section className="summary">
            <div className="summary-card">
                <h2>Total</h2>
                <p>{currencyFormatter.format(total)}</p>
            </div>

            <div className="summary-card">
                <h3>By Category</h3>
                {Object.keys(categoryTotals).length === 0 ? (
                    <p>No category totals yet.</p>
                ) : (
                    <ul>
                        {Object.entries(categoryTotals).map(([category, amount]) => (
                            <li key={category}>
                                {category}: {currencyFormatter.format(amount)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}

export default Summary;