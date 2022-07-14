"use strict";


const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { generateTokenFromPayload } = require('../helpers/webtoken');
const { dynamoClient } = require("../helpers/dynamodb");
const { createPlayer } = require("../helpers/players");

module.exports.handler = async (event) => {
  const id = createUuid();

  if (!event.body) {
    throw createError(400, 'missing name and gameId');
  }

  try {
    event.body = JSON.parse(event.body);
  } catch (err) {
    throw createError(400, 'missing name and gameId, body not valid JSON');
  }

  const gridSize = event.body.gridSize || 10;
  const creatorUserName = event.body.name || 'host';
  const creatorUserToken = generateTokenFromPayload({ gameId: id, name: creatorUserName });

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      ships: [
        {
          name: "battleship",
          size: 4
        }
      ],
      gridSize,
      players: [
        createPlayer(true, creatorUserName, creatorUserToken)
      ],
      grid: {}
    }
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  })

  if (!documentGetResult.Item) {
    throw createError(404, 'game not found');
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
