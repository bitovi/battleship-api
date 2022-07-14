"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

module.exports.handler = async (event) => {
    const id = createUuid();
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

    const id = body.gameId

    const documentGetResult = await dynamoClient.get({
        TableName: GAMES_TABLE_NAME,
        Key: {
            id
        }
    });

    if (!documentGetResult.Item) {
        throw createError(500);
    }


    return {
        statusCode: 200,
        body: JSON.stringify(
            documentGetResult.Item,
            null,
            2
        )
    };
};
