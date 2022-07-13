"use strict";

const { v4: createUuid } = require("uuid");
const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const dynamoClient = require("../common.js").dynamo;

module.exports.handler = async (event) => {
  const id = createUuid();
  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      message: "Hello Worlds!"
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

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  };
};
