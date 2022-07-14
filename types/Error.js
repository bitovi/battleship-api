module.exports = class Error {
  constructor(statusCode, message) {
    this.statusCode = statusCode,
    this.message = message
  }
}
