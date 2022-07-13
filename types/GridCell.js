module.exports = class GridCell {
  constructor(payload = {}) {
    this.hit = payload.hit ?? false;
    this.shipId = payload.shipId ?? null;
  }

  serialize() {
    return {
      hit: this.hit,
      shipId: this.shipId
    }
  }

  static deserialize(payload) {
    return new GridCell(payload);
  }
}