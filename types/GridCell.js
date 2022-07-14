module.exports = class GridCell {
  constructor(payload = {}) {
    this.shipIds = payload.shipIds ?? [];
  }

  serialize() {
    return {
      shipIds: this.shipIds
    }
  }

  static deserialize(payload) {
    return new GridCell(payload);
  }
}