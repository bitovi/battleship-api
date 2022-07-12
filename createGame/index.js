"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { v4: createUuid } = require("uuid");
const { AWS_REGION, GAMES_TABLE_NAME } = process.env;

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const dynamoClient = DynamoDBDocument.from(new DynamoDB({
  region: AWS_REGION,
  credentialDefaultProvider: credentialProvider
}));

module.exports.handler = async (event) => {
  const result = await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id: createUuid(),
      message: "Hello World!"
    }
  });

  return {
    statusCode: result.$metadata.httpStatusCode,
    body: JSON.stringify(
      result,
      null,
      2
    )
  };
};
