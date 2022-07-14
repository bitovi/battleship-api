"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { generateTokenFromPayload } = require('../helpers/webtoken');
const { createPlayer } = require("../helpers/players");
const { dynamoClient } = require("../helpers/dynamodb");

module.exports.handler = async (event) => {
  if (!event.body) {
    throw createError(400, 'missing name and gameId');
  }

  try {
    event.body = JSON.parse(event.body);
  } catch (err) {
    throw createError(400, 'missing name and gameId, body not valid JSON');
  }

  const { name, gameId } = event.body;

  if (!name) {
    throw createError(400, 'name is required');
  }

  if (!gameId) {
    throw createError(400, 'gameId is required');
  }

  const userToken = generateTokenFromPayload({ gameId: gameId, name: name })
  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  })

  if (!documentGetResult.Item) {
    throw createError(404, 'game not found');
  }

  // Add this new player to the game
  documentGetResult.Item.players.push(createPlayer(false, name, userToken));

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: documentGetResult.Item
  });

  const result = {
    userId: name,
    gridSize: documentGetResult.Item.gridSize,
    token: userToken
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
