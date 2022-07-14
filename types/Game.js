const { v4: createUuid } = require('uuid');
const GridCell = require('./GridCell');
const Player = require('./Player');
const GameError = require('./GameError');
const BattleShip = require('./ships/BattleShip');
module.exports = class Game {
  constructor(payload = {}) {
    this.id = payload.id ?? createUuid();
    this.gridSize = payload.gridSize;
    this.grid = payload.grid ?? this.createGrid(payload.gridSize ?? 10);
    this.players = payload.players ?? {};
    this.ships = payload.ships ?? {};
    this.owner = payload.owner;
  }

  placeShip(payload) {
    const ship = new BattleShip({userId: payload.userId})
    const playerShips = this.players[payload.userId].ships
    if(playerShips.length) {
      throw new GameError(400, "Can't place additional ships. Player already has a ship.")
    }

    playerShips.push(ship)

    if(payload.coordinates.length !== 2) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected exactly 2 sets of coordinates"}, null, 2),
      };
    }

    const coordinates = {
      x: {},
      y: {}
    }
    for(let coordinateSet of payload.coordinates) {
      if(coordinateSet.x === undefined || typeof coordinateSet.x !== 'number') {
        return {
          statusCode: 400,
          body: JSON.stringify({message: "Expected x coordinate"}, null, 2),
        };
      }
      if(coordinateSet.y === undefined || typeof coordinateSet.y !== 'number') {
        return {
          statusCode: 400,
          body: JSON.stringify({message: "Expected y coordinate"}, null, 2),
        };
      }
      coordinates['x'][coordinateSet.x] = true
      coordinates['y'][coordinateSet.y] = true
    }
    
    // find if ship is oriented correctly and correct length
    const xCount = Object.keys(coordinates['x']).length;
    const yCount = Object.keys(coordinates['y']).length;

    const gridCellsToUpdate = [];
    if ((xCount === 1 && yCount !== 1) || (xCount !== 1 && yCount === 1)) {
      // calculate midpoints 
      const sideWithLength = xCount > yCount ? 'x' : 'y';
      const sideWithoutLength = sideWithLength === 'x' ? 'y' : 'x';
      const staticCoordinate = Object.keys(coordinates[sideWithoutLength])[0];
      const endpointsArray = Object.keys(coordinates[sideWithLength]).sort();
      for (let i = endpointsArray[0]; i <= endpointsArray[1]; i++) {
        gridCellsToUpdate.push({
          [sideWithoutLength]: staticCoordinate,
          [sideWithLength]: i
        })
      }
    }
    else {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected ship to be horizontal or vertical"}, null, 2),
      };
    }

    if (gridCellsToUpdate.length !== BattleShip.size) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: `Expected ship to have size ${BattleShip.size}`}, null, 2),
      };
    } 

    // update grid
    gridCellsToUpdate.forEach(({x, y}) => {
      const cell = this.grid[x]?.[y];
      if (!cell) {
        return {
          statusCode: 400,
          body: JSON.stringify({message: 'Ship is out of bounds'}, null, 2),
        };
      }
      // put the shipId in the game cell
      cell.shipIds.push(ship.id);
    })
  }

  validatePlayer(userId) {
    if (!this.players[userId]) throw new GameError(403, 'Player is not in the game');
  }

  handleAttack(payload) {

  }

  createGrid(gridSize) {
    return Array(gridSize).fill().map(() => Array(gridSize).fill(new GridCell()));
  }

  serialize() {
    const players = {};
    const ships = {};
    for(let key in this.players) {
      players[key] = this.players[key].serialize()
    }
    for(let key in this.ships) {
      ships[key] = this.ships[key].serialize()
    }
    return {
      id: this.id,
      gridSize: this.gridSize,
      grid: this.grid.map(row => row.map(cell => cell.serialize())),
      players,
      ships,
      owner: this.owner.serialize()
    }
  }

  static deserialize(payload) {
    const game = new Game(payload) 
    const players = {};
    const ships = {};
    for(let key in payload.players) {
      players[key] = Player.deserialize(payload.players[key])
    }
    for(let key in payload.ships) {
      ships[key] = Player.deserialize(payload.ships[key])
    }

    game.grid = payload.grid.map(row => row.map(cell => new GridCell(cell)));
    game.owner = Player.deserialize(payload.owner);
    game.players = players;
    game.ships = ships;
    return game;
  }
};
