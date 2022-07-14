"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { dynamoClient } = require("../helpers/dynamodb");
const { validateUserToken } = require('../helpers/webtoken');

module.exports.handler = async (event) => {
    if (!event.headers.authorization) {
        throw createError(401, 'missing auth token');
    }

    // Check that the user has a valid jwt
    validateUserToken(event.headers.authorization);

    if (!event.body) {
        throw createError(400, 'missing name and gameId');
    }

    try {
        event.body = JSON.parse(event.body);
    } catch (err) {
        throw createError(400, 'missing name and gameId, body not valid JSON');
    }

    const { gameId, userId, coordinates } = event.body;

    // Get the game state from the database (hopefully)
    const documentGetResult = await dynamoClient.get({
        TableName: GAMES_TABLE_NAME,
        Key: {
            id: gameId
        }
    });

    // Does this game exist
    if (!documentGetResult.Item) {
        throw createError(404, 'game not found');
    }

    // Check that the player is in this game
    const player = documentGetResult.Item.players.find((player) => {
        return player.token === event.headers.authorization;
    });

    if (!player) {
        throw createError(400, "you're not part of this game");
    }

    // @TODO Do Attack Stuff Here!

    await dynamoClient.put({
        TableName: GAMES_TABLE_NAME,
        Item: documentGetResult.Item
    });

    return {
        statusCode: 200,
        body: JSON.stringify({})
    }
};
