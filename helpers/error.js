function createError(statusCode, err) {
    return {
        statusCode,
        body: JSON.stringify({ status: statusCode, details: err }),
        error: true
    }
}

module.exports = { createError };