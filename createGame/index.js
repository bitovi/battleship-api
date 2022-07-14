'use strict';

const { getDefaultRoleAssumerWithWebIdentity } = require('@aws-sdk/client-sts');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { AWS_REGION, GAMES_TABLE_NAME, AWS_DYNAMO_ENDPOINT } = process.env;
const { v4: createUuid } = require('uuid');
const createUser = require('../jwt/generateToken');

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

module.exports.handler = async (event) => {
  const { userName } = JSON.parse(event.body);
  const id = createUuid();
  const gameShips = [
    {
      name: 'Arizona Battleship',
      size: 4,
    },
  ];

  try {
    await dynamoClient.put({
      TableName: GAMES_TABLE_NAME,
      Item: {
        id,
        ships: gameShips,
      },
    });
  } catch (err) {
    throw new Error(err.message);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        gameId: id,
        ships: gameShips,
        token: createUser({ gameId: id, name: userName }),
      },
      null,
      2
    ),
  };
};
