"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { v4: createUuid } = require("uuid");
const { AWS_REGION, GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { generateTokenFromPayload } = require('../helpers/webtoken')

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const dynamoClient = DynamoDBDocument.from(new DynamoDB({
  region: AWS_REGION,
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey'
  },
  credentialDefaultProvider: credentialProvider
}));

module.exports.handler = async (event) => {
  const id = createUuid();

  const body = JSON.parse(event.body)
  const gridSize = body.gridSize || 10
  const creatorUserName = body.name || 'host'
  const creatorUserToken = generateTokenFromPayload({ id, name: creatorUserName })

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      ships: [
        {
          "name": "battleship",
          "size": 4
        }
      ],
      gridSize,
      players: [
        {
          isAdmin: true,
          name: creatorUserName,
          token: creatorUserToken
        }
      ]
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

  const result = {
    gameId: id,
    ships: documentGetResult.Item.ships,
    token: creatorUserToken
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      result,
      null,
      2
    )
  }
};
