const { v4: createUuid } = require('uuid');

module.exports = class Game {
  constructor() {
    this.id = createUuid();
    this.grid = this.createGrid(10);
    this.players = [];
  }

  createGrid(gridSize) {
    return Array(gridSize).map(() => Array(gridSize).fill(null));
  }
};
