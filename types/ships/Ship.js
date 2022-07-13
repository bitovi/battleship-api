module.exports = class Ship {
  constructor(payload) {
    this.length = payload.length;
    this.userId = payload.userId;
  }
}