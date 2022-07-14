"use strict";

const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");

module.exports.handler = async (event) => {
  if (!event.body) {
    return createError(400, 'missing name and gameId');
  }

  try {
    event.body = JSON.parse(event.body);
  } catch (err) {
    return createError(400, 'missing name and gameId, body not valid JSON');
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

  // Check that the player is in this game
  const player = documentGetResult.Item.players.find((player) => {
    return player.token === event.headers.authorization;
  });

  if (!player) {
    return createError(400, "you're not part of this game");
  }

  if (!player.isAdmin) {
    return createError(400, "only the game owner can start it");
  }

  if (documentGetResult.Item.players.length < 2) {
    return createError(400, "need more players to start");
  }

  let playersReady = true;
  if (documentGetResult.Item.players.forEach((player) => {
    if (player.shipCount !== documentGetResult.Item.ships.length) {
      playersReady = false;
    }
  }));

  if (!playersReady) {
    return createError(400, "some players have not placed ships");
  }

  // Update the game state to make it as started
  documentGetResult.Item.gameStarted = true;

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: documentGetResult.Item
  });

  return {
    statusCode: 200
  }
};
