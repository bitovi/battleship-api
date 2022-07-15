"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;
const {
  isVerticalCheck,
  getVaryingCord,
  isOutOfBound,
  isGreaterThanShipSize,
  getArrayOfZerosFromNumber
} = require("../common.js");

module.exports.handler = async (event) => {
  let body;
  let header;
  try {
    body = JSON.parse(event.body);
    header = event.headers;
  } catch (err) {
    console.log(err)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }
  
  const payload = jwt.verify(header.authorization, privateKey)
  const {
    gameId,
    userId
  } = payload;
  //validate gameId
  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  });
  if (!documentGetResult.Item) {
    throw createError('Game ID Entered Does Not Exist');
  }

  const Game = documentGetResult.Item;
  
  const gridSize = Game.gridSize;
  
  const shipSize = Game.ships[0].size;
  const shipName = body.shipName;
  if (isOutOfBound(body.coordinates, gridSize)) throw createError("ship out of bounds"); //out-of-bounds
  if (isGreaterThanShipSize(body.coordinates, shipSize)) throw createError("ship not placed correctly, cannot place diagonally"); //not-placed-correctly
  
  const isVertical = isVerticalCheck(body.coordinates);
  const varyingCord = getVaryingCord(body.coordinates, isVertical);
  
  const constCoord = isVertical ? body.coordinates[0].x : body.coordinates[0].y;
  const userShip = {
    shipName: shipName,
    isVertical,
    constCoord,
    varyingCord,
    eliminated: getArrayOfZerosFromNumber(shipSize)
  };

  const updatedPlayer = Game.players.map(player => {
    if (player.userId === userId) {
      player.ship = userShip;
    }
    return player;
  });

   await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...Game,
      players: updatedPlayer
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Ship successfully placed"
      },
      null,
      2
    )
  };
};
