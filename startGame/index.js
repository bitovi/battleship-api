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

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        route: 'startGame',
      },
      null,
      2
    ),
  };
};
