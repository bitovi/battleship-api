'use strict';

const Game = require('../types/Game');
const Player = require('../types/Player');
const BattleShip = require('../types/ships/BattleShip');
const { getTokenForGame } = require('../token');
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { AWS_REGION, GAMES_TABLE_NAME, AWS_DYNAMO_ENDPOINT } = process.env;
const createGameError = require("http-GameErrors");

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
  const { name, gridSize } = parsedBody;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "The property 'name' is required"}, null, 2),
    };
  }

  const gameOwner = new Player({ name });

  const game = new Game({owner: gameOwner, gridSize});

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
    throw createGameError(500);
  }

  const returnValue = {
    id: documentGetResult.Item.id,
    ships: [BattleShip.describeShip()],
    token: getTokenForGame(gameOwner.id)
  } 

  return {
    statusCode: 200,
    body: JSON.stringify(returnValue, null, 2),
  };
};
