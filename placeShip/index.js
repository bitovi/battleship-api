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

    const { gameId, shipName, coordinates } = event.body;

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

    const gridSize = documentGetResult.Item.gridSize;

    // Check the players ship placing bounds
    const { x1, y1 } = coordinates[0];
    const { x2, y2 } = coordinates[1];

    if (x1 < 0 || x1 > gridSize) {
        throw createError(400, 'start coord out of bounds');
    }

    if (y1 < 0 || y1 > gridSize) {
        throw createError(400, 'start coord out of bounds');
    }

    if (x2 < 0 || x2 > gridSize) {
        throw createError(400, 'end coord out of bounds');
    }

    if (y2 < 0 || y2 > gridSize) {
        throw createError(400, 'end coord out of bounds');
    }

    const currentShip = documentGetResult.Item.ships.find((ship) => {
        return ship.name === shipName;
    });

    if (!currentShip) {
        throw createError(400, 'ship doesnt exist');
    }

    // Take the players ship info, try and place it in the grid
    if (!placeShip(coordinates[0], coordinates[1], currentShip.size, player)) {
        throw createError(400, "already a ship here");
    }

    player.shipCount++;

    await dynamoClient.put({
        TableName: GAMES_TABLE_NAME,
        Item: documentGetResult.Item
    });

    return {
        statusCode: 204
    }
};

function placeShip(startCoord, endCoord, shipSize, player) {

    const xOffset = endCoord.x - startCoord.x;
    const yOffset = endCoord.y - startCoord.y;

    const ship = {};

    if (xOffset === 0 && Math.abs(yOffset) === shipSize) {
        const inc = yOffset > 0 ? 1 : -1;
        for (let i = startCoord.y; i < startCoord.y + yOffset; i = i + inc) {
            const currentCoord = [startCoord.x + "_" + i];
            if (player.userGrid[currentCoord]) {
                throw createError(400, "you have a ship at this position");
            }

            ship[currentCoord] = { shipId: player.shipCount, hit: false };
        }
    } else if (yOffset === 0 && Math.abs(xOffset) === shipSize) {
        const inc = xOffset > 0 ? 1 : -1;
        for (let i = startCoord.x; i < startCoord.x + xOffset; i = i + inc) {
            const currentCoord = [i + "_" + startCoord.y];
            if (player.userGrid[currentCoord]) {
                throw createError(400, "you have a ship at this position");
            }

            ship[currentCoord] = { shipId: player.shipCount, hit: false };
        }
    } else {
        throw createError(400, "your ship is invalid");
    }

    Object.assign(player.userGrid, ship);
    return true;
}