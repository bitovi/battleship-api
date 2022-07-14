function createError(statusCode, err) {
    return {
        statusCode,
        body: JSON.stringify({ status: statusCode, details: err })
    }
}

module.exports = { createError };