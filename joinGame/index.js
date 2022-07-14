'use strict';

const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { AWS_REGION, GAMES_TABLE_NAME, AWS_DYNAMO_ENDPOINT } = process.env;
const { v4: createUuid } = require('uuid');
const createUser = require('../jwt/generateToken');
const casual = require('casual');

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
  const body = JSON.parse(event.body);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          error: 'Fill the params',
        },
        null,
        2
      ),
    };
  }

  const { gameId: id } = body;
  const { userName } = body;

  if (!id) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        {
          message: 'Game not found',
        },
        null,
        2
      ),
    };
  }

  if (!userName) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: 'Name is required',
        },
        null,
        2
      ),
    };
  }

  const game = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id,
    },
  });

  if (!game.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        {
          message: 'Game not found',
        },
        null,
        2
      ),
    };
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
