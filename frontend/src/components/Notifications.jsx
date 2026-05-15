function Notifications({ error, message }) {
    return (
        <>
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
        </>
    )
}

export default Notifications;