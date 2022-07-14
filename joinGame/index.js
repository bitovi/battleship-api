'use strict';

const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { AWS_REGION, GAMES_TABLE_NAME, AWS_DYNAMO_ENDPOINT } = process.env;
const { v4: createUuid } = require('uuid');
const createUser = require('../jwt/generateToken');
const error = require('../utils/error');

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});
const configuration = AWS_DYNAMO_ENDPOINT
  ? {
      credentials: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
      },
      endpoint: AWS_DYNAMO_ENDPOINT,
    }
  : {
      credentialDefaultProvider: credentialProvider,
    };
const dynamoClient = DynamoDBDocument.from(
  new DynamoDB({
    region: AWS_REGION,
    ...configuration,
  })
);
//TODO: Check if we can use middlewares (jsonbodyparser)
module.exports.handler = async (event) => {
  if (!event.body) {
    return error(400, 'Body not found.');
  }
  const body = JSON.parse(event.body);

  const { gameId: id } = body;
  const { name: userName } = body;

  if (!id) {
    return error(400, 'Game is required.');
  }

  if (!userName) {
    return error(400, 'Name is required.');
  }

  const game = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id,
    },
  });

  if (!game.Item) {
    return error(404, 'Game not found.');
  }

  const userId = createUuid();
  const players = [...game.Item.players, userId];

  try {
    await dynamoClient.put({
      TableName: GAMES_TABLE_NAME,
      Item: {
        id,
        players,
      },
    });
  } catch (err) {
    throw new Error(err.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        userId,
        gridSize: game.Item.gridSize,
        token: createUser({ gameId: id, name: userName }),
      },
      null,
      2
    ),
  };
};
