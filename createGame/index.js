"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { v4: createUuid } = require("uuid");
const { AWS_REGION, GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const dynamoClient = DynamoDBDocument.from(new DynamoDB({
  region: AWS_REGION,
  credentialDefaultProvider: credentialProvider
}));

module.exports.handler = async (event) => {
  const id = createUuid();
  const documentPutResult = await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      message: "Hello World!"
    }
  });

  if (documentPutResult.$metadata.httpStatusCode !== 200) {
    throw createError(documentPutResult.$metadata.httpStatusCode);
  }

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  })

  return {
    statusCode: documentGetResult.$metadata.httpStatusCode,
    body: JSON.stringify(
      documentGetResult,
      null,
      2
    )
  };
};
