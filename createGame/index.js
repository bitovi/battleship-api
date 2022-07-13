"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { AWS_REGION, GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const { faker } = require('@faker-js/faker');
const createUser = require('./generateToken');

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

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

module.exports.handler = async (event) => {
  const { userName } = JSON.parse(event.body);
  const id = faker.datatype.uuid();
  const gameShips = [
    {
      "name": "Arizona Battleship",
      "size": 4
    }
  ];
  const documentPutResult = await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: {
      id,
      ships: gameShips
    },
  });

  if(documentPutResult.$metadata.httpStatusCode != 200) {
    throw createError(500);
  }
  
  /*const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id,
    },
  });

  if (!documentGetResult.Item) {
    throw createError(500);
  }
  */

  return {
    statusCode: 200,
    body: JSON.stringify({
        gameId: id,
        ships: gameShips, 
        token: createUser({ gameId: id, name: userName })
      }, null, 2),
  };
};
