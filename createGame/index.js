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

<<<<<<< HEAD
const dynamoClient = DynamoDBDocument.from(
  new DynamoDB({
    region: AWS_REGION,
    endpoint: "http://localhost:8000",
    credentials: {
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
    },
    credentialDefaultProvider: credentialProvider,
  })
);
=======
const dynamoClient = DynamoDBDocument.from(new DynamoDB({
  region: AWS_REGION,
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey'
  },
  credentialDefaultProvider: credentialProvider
}));
>>>>>>> 75920eeea6f634d7ccb395726ef5d95732711387

module.exports.handler = async (event) => {
  const id = createUuid();
  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      message: "Hello World!",
    },
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id,
    },
  });

  if (!documentGetResult.Item) {
    throw createError(500);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(documentGetResult.Item, null, 2),
  };
};
