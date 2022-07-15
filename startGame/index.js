"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

module.exports.handler = async (event) => {
  let body;
  let header;
  try {
    body = JSON.parse(event.body);
    header = event.headers;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }

  const payload = jwt.verify(header.authorization, privateKey);
  const {
    gameId,
    isAdmin
  } = payload;

  if(!isAdmin) throw createError("Cannot start game, only user that created game has permission");
  if(body.gameId !== gameId) throw createError("Invalid GameId provided for host");

  //validate gameId
  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  })
  if (!documentGetResult.Item) {
    throw createError('Game ID Entered Does Not Exist');
  }
  
  if (documentGetResult.Item.status != 'pending') throw createError(`game cannot be started since game has ${documentGetResult.Item.status}`);
  const activePlayers = documentGetResult.Item.players.length;
  documentGetResult.Item.players.map(player => {
    if (!player.ship) throw createError(`${player.name}'s ship has not been placed `);
  })
  if (activePlayers <= 1) throw createError("There must be more than one player present to start a game");
  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...documentGetResult.Item,
      activePlayers: activePlayers,
      status: 'started',
    }
  });

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Game successfully started"
        },
        null,
        2
      )
    };
};
