'use strict';

const Game = require('../types/Game');
const Player = require('../types/Player');
const { getTokenForGame } = require('../token');
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { AWS_REGION, GAMES_TABLE_NAME, AWS_DYNAMO_ENDPOINT } = process.env;

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});
const configuration = AWS_DYNAMO_ENDPOINT ?
  {
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    },
    endpoint: AWS_DYNAMO_ENDPOINT
  } : {
    credentialDefaultProvider: credentialProvider
  }
const dynamoClient = DynamoDBDocument.from(new DynamoDB({
  region: AWS_REGION,
  ...configuration,
}));

module.exports.handler = async (event) => {
  const parsedBody = JSON.parse(event.body);
  const { name, gameId } = parsedBody;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "The property 'name' is required"}, null, 2),
    };
  }

  if (!gameId) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "The property 'gameId' is required"}, null, 2),
    };
  }

  const player = new Player({ name });

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
  });

  if (!documentGetResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({message: "Game not found"}, null, 2),
    };
  }


  const game = Game.deserialize(documentGetResult.Item);

  game.players[player.id] = player

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: game.serialize(),
  });

  const returnValue = {
    gridSize: game.gridSize,
    token: getTokenForGame(player.id)
  } 

  return {
    statusCode: 200,
    body: JSON.stringify(returnValue, null, 2),
  };
};
