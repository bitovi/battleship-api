"use strict";

const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");
const { validateUserToken } = require('../helpers/webtoken');

module.exports.handler = async (event) => {
    if (!event.headers.authorization) {
        return createError(401, 'missing auth token');
    }

    // Check that the user has a valid jwt
    validateUserToken(event.headers.authorization);

    if (!event.body) {
        return createError(400, 'missing name and gameId');
    }

    try {
        event.body = JSON.parse(event.body);
    } catch (err) {
        return createError(400, 'missing name and gameId, body not valid JSON');
    }

    const { gameId, coordinates } = event.body;

    // Get the game state from the database (hopefully)
    const documentGetResult = await dynamoClient.get({
        TableName: GAMES_TABLE_NAME,
        Key: {
            id: gameId
        }
    });

    // Does this game exist
    if (!documentGetResult.Item) {
        return createError(404, 'game not found');
    }

    // Check that the game has started
    if (!documentGetResult.Item.gameStarted) {
        return createError(400, 'cannot attack until the game starts');
    }

    // Check that the game has started
    if (documentGetResult.Item.gameOver) {
        return createError(400, 'cannot attack once the game is over');
    }

    // Check that the player is in this game
    const player = documentGetResult.Item.players.find((player) => {
        return player.token === event.headers.authorization;
    });

    if (!player) {
        return createError(400, "you're not part of this game");
    }

    if (player.playerHp === 0) {
        return createError(400, "you cannot attack, you are dead");
    }


    const attackRateLimit = 5 * 1000;
    if (player.lastAttackTime && (new Date() - new Date(player.lastAttackTime)) < attackRateLimit) {
        return createError(400, "rate limit");
    }

    let didHitSomeone = false;
    let isSomeoneAlive = false;

    const attackCoord = coordinates.x + "_" + coordinates.y;
    documentGetResult.Item.players.forEach((player) => {
        if (player.token === event.headers.authorization) {
            return;
        }

        const currentGrid = player.userGrid[attackCoord];
        if (currentGrid) {
            if (!currentGrid.hit) {
                didHitSomeone = true;
                player.playerHp--;
            }
            currentGrid.hit = true;
        }

        if (player.playerHp > 0) {
            isSomeoneAlive = true;
        }
    });

    player.lastAttackTime = Date.now();

    const result = {
        "hit": didHitSomeone,
        "gameOver": !isSomeoneAlive,
        "winner": !isSomeoneAlive && didHitSomeone
    }

    // Update the game state to make it as started
    documentGetResult.Item.gameOver = !isSomeoneAlive;

    await dynamoClient.put({
        TableName: GAMES_TABLE_NAME,
        Item: documentGetResult.Item
    });

    return {
        statusCode: 200,
        body: JSON.stringify(result)
    }
};
