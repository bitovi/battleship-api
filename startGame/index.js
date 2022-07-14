"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

module.exports.handler = async () => {

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

  const payload = jwt.verify(header.token, privateKey)
  const {
    gameId,
    isAdmin
  } = payload

  if(!isAdmin) throw createError("Cannot start game, only user that created game has permission")
  if(body.gameId !== gameId) throw createError("Invalid GameId provided for host")

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

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...documentGetResult.Item, 
      status: 'started',
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ result: "Game Successfully started!" })
  };
};
