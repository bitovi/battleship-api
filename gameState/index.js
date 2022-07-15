"use strict";

const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");

module.exports.handler = async (event) => {
  const { gameId } = event.queryStringParameters

  if (!gameId) {
    return createError(400, 'gameId is required');
  }

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  })

  if (!documentGetResult.Item) {
    return createError(404, 'game not found');
  }

  if (documentGetResult.Item.players.length > 0) {
    documentGetResult.Item.players.forEach((player) => {
      delete player.token;
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  }
};
