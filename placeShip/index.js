'use strict';

const BattleShip = require('../types/ships/BattleShip');
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
  const { userId, gameId, shipName } = parsedBody;

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
    if(coordinateSet.x === undefined || typeof coordinateSet.x !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected x coordinate"}, null, 2),
      };
    }
    if(coordinateSet.y === undefined || typeof coordinateSet.y !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({message: "Expected y coordinate"}, null, 2),
      };
    }
    coordinates['x'][coordinateSet.x] = true
    coordinates['y'][coordinateSet.y] = true
  }
  
  // find if ship is oriented correctly and correct length
  const xCount = Object.keys(coordinates['x']).length;
  const yCount = Object.keys(coordinates['y']).length;

  const gridCellsToUpdate = [];
  if ((xCount === 1 && yCount !== 1) || (xCount !== 1 && yCount === 1)) {
    // calculate midpoints 
    const sideWithLength = xCount > yCount ? 'x' : 'y';
    const sideWithoutLength = sideWithLength === 'x' ? 'y' : 'x';
    const staticCoordinate = Object.keys(coordinates[sideWithoutLength])[0];
    const endpointsArray = Object.keys(coordinates[sideWithLength]).sort();
    for (let i = endpointsArray[0]; i <= endpointsArray[1]; i++) {
      gridCellsToUpdate.push({
        sideWithoutLength: staticCoordinate,
        sideWithLength: i
      })
    }
  }
  else {
    return {
      statusCode: 400,
      body: JSON.stringify({message: "Expected ship to be horizontal or vertical"}, null, 2),
    };
  }

  if (gridCellsToUpdate.length !== BattleShip.size) {
    return {
      statusCode: 400,
      body: JSON.stringify({message: `Expected ship to have size ${BattleShip.size}`}, null, 2),
    };
  } 

  // update grid
  gridCellsToUpdate.forEach(cell => {

  })


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
