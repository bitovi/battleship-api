"use strict";


const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { generateTokenFromPayload } = require('../helpers/webtoken');
const { dynamoClient } = require("../helpers/dynamodb");

module.exports.handler = async (event) => {
  const id = createUuid();

  const body = JSON.parse(event.body) || {}
  const gridSize = body.gridSize || 10
  const creatorUserName = body.name || 'host'
  const creatorUserToken = generateTokenFromPayload({ gameId: id, name: creatorUserName })

  const grid = {}

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      ships: [
        {
          "name": "battleship",
          "size": 4
        }
      ],
      gridSize,
      players: [
        {
          isAdmin: true,
          name: creatorUserName,
          token: creatorUserToken,
          userGrid: {},
          shipCount: 0
        }
      ],
      grid: grid
    }
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  })

  if (!documentGetResult.Item) {
    throw createError(500);
  }

  const result = {
    gameId: id,
    ships: documentGetResult.Item.ships,
    token: creatorUserToken
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      result,
      null,
      2
    )
  }
};
