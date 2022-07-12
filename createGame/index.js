"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const client = new DynamoDB({
  region: "us-east-1",
  credentialDefaultProvider: credentialProvider
});

module.exports.handler = async (event) => {
  const results = await client.listTables({});
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        results,
        GAMES_TABLE_NAME: process.env.GAMES_TABLE_NAME
      },
      null,
      2
    ),
  };
};
