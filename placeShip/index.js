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
  isGreaterThanShipSize
} = require("../common.js");

module.exports.handler = async (event) => {
  let body;
  let header;
  try {
    body = JSON.parse(event.body);
    header = JSON.parse(event.header)
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }

  const payload = jwt.verify(header.token, privateKey);
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
  const gridSize = documentGetResult.Item.gridSize;
  const shipSize = documentGetResult.Item.ships[0].shipSize;
  if (isOutOfBound(body.coordinates, gridSize)) throw createError("Out of Bounds");
  if (isGreaterThanShipSize(body.coordinates, shipSize)) throw createError("Ship is too big");
  const isVertical = isVerticalCheck(body.coordinates);
  const varyingCord = getVaryingCord(body.coordinates, isVertical);
  const constCoord = isVertical ? body.coordinates[0].x : body.coordinates[0].y;
  const shipName = body.shipName;
  const userShip = {
    shipName: shipName,
    isVertical: isVertical,
    constCoord: constCoord,
    varyingCord,
  };
  const updatedPlayer = players.map(player => {
    if (player.userId === userId) {
      player.ship = userShip
    }
  });
  const players = await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...documentGetResult.Item,
      players: updatedPlayer
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        userId: userId,
        gridSize: documentGetResult.Item.gridSize,
      },
      null,
      2
    )
  };
};
