module.exports = class GridCell {
  constructor(payload = {}) {
    this.wasShot = payload.wasShot ?? false;
    this.shipId = payload.shipId ?? null;
  }

  serialize() {
    return {
      hit: this.wasShot,
      shipId: this.shipId
    }
  }

  static deserialize(payload) {
    return new GridCell(payload);
  }
}