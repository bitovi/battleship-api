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
  
  const shipSize = Game.ships[0].shipSize;
  const shipName = body.shipName;
  let errorMessage;
  if (isOutOfBound(body.coordinates, gridSize)) errorMessage = "ship out of bounds"; //out-of-bounds
  if (isGreaterThanShipSize(body.coordinates, shipSize)) errorMessage = "ship not placed correctly, cannot place diagonally"; //not-placed-correctly
  
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

  const responseBody = errorMessage ?
    {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: errorMessage
        },
        null,
        2
      )
    } : {
      statusCode: 204
    };

  return responseBody;
};
