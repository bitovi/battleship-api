"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { generateTokenFromPayload } = require('../helpers/webtoken');
const { dynamoClient } = require("../helpers/dynamodb");
const { createPlayer } = require("../helpers/players");

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

  const maxShipParts = shipsPerPlayer * averageShipSize;

  const gameGrid = [];
  const players = [];
  const ships = [];

  // Create a list of random ships for the game state
  for (let i = 0; i < shipsPerPlayer; i++) {
    ships[i] = {
      name: generateRandomName(),
      length: averageShipSize
    }
  }

  // For every grid square, generate the 2d array
  for (let x = 0; x < gridSize; x++) {

    if (!gameGrid[x]) {
      gameGrid[x] = [];
    }

    for (let y = 0; y < gridSize; y++) {
      gameGrid[x][y] = { ships: [] };
    }
  }

  // Create a list of random players for the game state
  for (let i = 0; i < playerCount; i++) {
    const playerName = generateRandomName();
    const player = createPlayer(false, playerName, generateTokenFromPayload({ gameId: id, name: playerName }))

    let shipParts = 0;

    // randomly place ship parts in the grid for this player
    while (shipParts < maxShipParts) {
      const placeX = Math.floor(Math.random() * gridSize);
      const placeY = Math.floor(Math.random() * gridSize);

      const placeCoord = placeX + "_" + placeY;

      if (!player.userGrid[placeCoord]) {
        player.userGrid[placeCoord] = {
          "hit": (placeX % 2) ? true : false,
          "shipId": Math.floor((shipParts / averageShipSize))
        }

        shipParts++;
      }
    }

    players[i] = player
  }

  const gameState = {
    id,
    ships: ships,
    gameGrid,
    gridSize,
    players: players,
    gameStarted: false,
    gameOver: false
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
    averageShipSize,
    shipsPerPlayer,
    maxShipParts,
    csv: `test2,${gridSize},${playerCount},${density},${gameStateBytes}`
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
