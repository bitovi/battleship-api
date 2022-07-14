module.exports = class GameError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode,
    this.message = JSON.stringify(message, null, 2)
  }
}