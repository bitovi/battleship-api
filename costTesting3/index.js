"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");

function generateRandomName(length) {
  let r = (Math.random() + 1).toString(36).substring(length || 7);
  return r;
}

module.exports.handler = async (event) => {
  const id = createUuid();

  if (!event.queryStringParameters) {
    return createError(400, 'missing queryStringParameters');
  }

  const { gridSize, playerCount, density, doDynamoWrite } = event.queryStringParameters;

  const averageShipSize = 4;
  const shipsPerPlayer = Math.round((gridSize / averageShipSize) * (density / 100));

  const players = [];
  const ships = [];

  // Create a list of random ships for the game state
  for (let i = 0; i < shipsPerPlayer; i++) {
    ships[i] = {
      name: generateRandomName(),
      length: averageShipSize
    }
  }

  // Create a list of random players for the game state
  for (let i = 0; i < playerCount; i++) {
    const playerName = generateRandomName();
    // const player = createPlayer(false, playerName, generateTokenFromPayload({ gameId: id, name: playerName }))
    const playerShips = []

    for (let j = 0; j < shipsPerPlayer; j++) {
      playerShips.push({
        shipName: generateRandomName(),
        isVertical: Math.round(Math.random()) === 1,
        constCoord: Math.floor(Math.random() * gridSize),
        varyingCord: Math.floor(Math.random() * gridSize),
        eliminated: Array.from({length: averageShipSize}).fill(0)
      });
    }

    const player = {
        userId: createUuid(),
        name: playerName,
        isAdmin: false,
        isEliminated: false,
        ships: playerShips
    };
    players[i] = player
  }

  const status = ['pending','started','ended'];

  const gameState = {
    id,
    ships: ships,
    gridSize,
    players: players,
    gridSize: gridSize,
    ships: ships,
    status: status[Math.floor(Math.random() * status.length)],
    winner: false,
  }

  if (doDynamoWrite === 'true') {
    await dynamoClient.put({
      TableName: GAMES_TABLE_NAME,
      Item: gameState
    });
  }

  const gameStateString = JSON.stringify(gameState);
  const gameStateBytes = Buffer.byteLength(gameStateString, 'utf-8');

  const results = {
    gameId: id,
    gameStateBytes,
    gridSize,
    playerCount,
    density,
    doDynamoWrite,
    csv: `${gridSize},${playerCount},${density},${gameStateBytes}`
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      results,
      null,
      2
    )
  }
};
