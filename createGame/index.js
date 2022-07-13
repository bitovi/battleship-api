'use strict';

const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { v4: createUuid } = require('uuid');
const { AWS_REGION, GAMES_TABLE_NAME } = process.env;
const createError = require('http-errors');
const Game = require('../types/Game');
const Player = require('../types/Player');

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const dynamoClient = DynamoDBDocument.from(
  new DynamoDB({
    region: AWS_REGION,
    credentialDefaultProvider: credentialProvider,
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    },
    endpoint: 'http://localhost:8000',
  })
);

module.exports.handler = async (event) => {
  const parsedBody = JSON.parse(event.body);
  const { name } = parsedBody;
  const gameOwner = new Player({ name });

  const game = new Game({owner: gameOwner});

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: game.serialize(),
  });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: game.id,
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
