'use strict';

const BattleShip = require('../types/BattleShip');
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
  {
    "userId": "string",
    "gameId": "7cc114ab-2656-4295-b4c2-0a6088557ec9",
    "shipName": "battleship",
    "coordinates": [
      {
        "x": 30,
        "y": 50
      },
      {
        "x": 34,
        "y": 50
      }
    ]
  }

  const parsedBody = JSON.parse(event.body);
  const { userId, gameId, shipName, coordinates } = parsedBody;

  ["userId", "gameId", "shipName", "coordinates"].forEach((reqField) => {
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

  const ship = new BattleShip({userId})
  const playerShips = game.players[userId].ships
  if(playerShips.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Can't place additional ships. Player already has a ship."}, null, 2),
    };
  }

  playerShips.push(ship)

  game.grid 
  parsedBody.coordinates
  //validate coordinates
  if(parsedBody.coordinates.length !== 2) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Expected exactly 2 sets of coordinates"}, null, 2),
    };
  }

  const coordinates = {
    x: {},
    y: {}
  }
  for(let coordinateSet of parsedBody.coordinates) {
    if(!coordinateSet.x) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected x coordinate"}, null, 2),
      };
    }
    if(!coordinateSet.y) {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected y coordinate"}, null, 2),
      };
    }
    coordinates[x][coordinateSet.x] = true
    coordinates[y][coordinateSet.y] = true
  }
  //here


  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: game.serialize(),
  });

  const returnValue = {
    userId: player.id,
    gridSize: game.gridSize,
    token: getTokenForGame(player.id)
  } 

  return {
    statusCode: 200,
    body: JSON.stringify(returnValue, null, 2),
  };
};
