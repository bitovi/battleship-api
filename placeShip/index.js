'use strict';

const BattleShip = require('../types/ships/BattleShip');
const Game = require('../types/Game');
const Player = require('../types/Player');
const { getIdForUser } = require('../token');
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
  // {
  //   "userId": "string",
  //   "gameId": "7cc114ab-2656-4295-b4c2-0a6088557ec9",
  //   "shipName": "battleship",
  //   "coordinates": [
  //     {
  //       "x": 30,
  //       "y": 50
  //     },
  //     {
  //       "x": 34,
  //       "y": 50
  //     }
  //   ]
  // }

  const parsedBody = JSON.parse(event.body);
  const { gameId, shipName } = parsedBody;
  let userId;
  try {
    userId = getIdForUser(event)
    parsedBody.userId = userId;
  }
  catch(e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    };
  }

  ["gameId", "shipName", "coordinates"].forEach((reqField) => {
    if(!parsedBody[reqField]) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: `The property '${reqField}' is required`}, null, 2),
      };
    }
  })

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

  try {
    game.validatePlayer(userId);
    game.placeShip(parsedBody)
  }
  catch (e) {
    return {
      statusCode: e.statusCode,
      body: JSON.stringify(e.message, null, 2)
    };
  }

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: game.serialize(),
  });

  return {
    statusCode: 204
  };
};
