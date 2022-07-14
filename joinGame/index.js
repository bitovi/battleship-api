"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

module.exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }

  const gameId = body.gameId ?? '';  
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

  const userId = createUuid();
  const newUserName = body.name ?? '';
  const userToken = jwt.sign({ gameId, userId }, privateKey, {});

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...documentGetResult.Item, 
      players:[
        ...documentGetResult.Item.players,
        {
          userId,
          name: newUserName,
          isAdmin: false,
          isEliminated: false,
        }
      ]
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        userId: userId,
        gridSize: documentGetResult.Item.gridSize,
        token: userToken
      },
      null,
      2
    )
  };
};
