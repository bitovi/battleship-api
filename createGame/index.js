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

  const gridSize = body.gridSize ?? 10;
  const hostName = body.userName ?? 'host';
  const shipName = hostName + "'s Ship";
  const shipSize = body.shipSize ?? 4;
  const userId = createUuid();
  const ships = [
    {
      name: shipName,
      size: shipSize
    }
  ];

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      gridSize: gridSize,
      ships: ships,
      status: 'pending',
      winner: false,
      players: [
        {
          userId,
          name: hostName,
          isAdmin: true,
          isEliminated: false,
        }
      ]
    }
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  });

  if (!documentGetResult.Item) {
    throw createError(400,'Invalid result');
  }

  documentGetResult.Item.token = jwt.sign({ gameId: id, userId, isAdmin: true }, privateKey, {});

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  };
};
