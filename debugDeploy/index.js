"use strict";

const { GAMES_TABLE_NAME } = process.env;
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;
const options = require('../common.js').options;

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      event: event,
      options: options,
      privateKey: privateKey,
      dynamoClient: dynamoClient,
      tableName: GAMES_TABLE_NAME
    },
      null,
      2
    )
  };
};
