"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

module.exports.handler = async (event) => {
  const id = createUuid();
  let body = null;
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

  if (!body.gridSize) {
    body.gridSize = 10;
  }

  if (!body.userName) {
    body.userName = new Date();
  }

  if (!body.shipName) {
    body.shipName = body.userName + "'s Ship"
  }

  if (!body.shipSize) {
    body.shipSize = 4
  }

  const { gridSize, userName } = body;

  const ships = [
    {
      name: body.shipName,
      size: body.shipSize
    }
  ]

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      gridSize: gridSize,
      gameAdmin: userName,
      ships: ships
    }
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  })

  if (!documentGetResult.Item) {
    throw createError(500);
  }

  documentGetResult.Item.token = jwt.sign({}, privateKey, {});

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  };
};
