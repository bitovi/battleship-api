"use strict";

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDB({ region: "us-east-1" });

module.exports.handler = async (event) => {
  const results = await client.listTables({});
  return {
    statusCode: 200,
    body: JSON.stringify(
      results,
      null,
      2
    ),
  };
};
