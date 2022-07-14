"use strict";

const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");

module.exports.handler = async (event) => {
  if (!event.body) {
    return createError(400, 'missing body');
  }

  try {
    event.body = JSON.parse(event.body);
  } catch (err) {
    return createError(400, 'missing gameId, body not valid JSON');
  }

  const { gameId } = event.body;

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

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  }
};
