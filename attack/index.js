"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;
const {
  checkAttack,
  isEliminated,
  sumArray
} =require("../common.js");

/*
{
  "gameId": "7cc114ab-2656-4295-b4c2-0a6088557ec9",
  "userId": "string",  NOT NEEDED(GET FROM TOKEN)
  "coordinates": [
    {
      "x": 40,
      "y": 30
    }
  ]
}
 */
module.exports.handler = async (event) => {
  let body;
  let header;
  try {
    body = JSON.parse(event.body);
    header = event.headers.authorization;

  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }
  const payload = jwt.verify(header, privateKey);

  const {
    userId,
    gameId
  } = payload;

  const x = body.coordinates[0].x
  const y = body.coordinates[0].y
  const id = gameId
  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id
    }
  });

  if (!documentGetResult.Item) {
    throw createError(500);
  }

  let Game = documentGetResult.Item;
  let hit = false;
  let noOfActivePlayers = Game.activePlayers;
  let status;
  let winner;

  if(Game.status === 'pending') throw createError("Game has not been started"); 
  if(noOfActivePlayers <= 1 ) throw createError("Only one player cannot start a game"); 
  if (Game.status === 'ended') {
    //check if player is eliminated
    const currentPlayer = Game.players.filter(player => player.userId === userId)
  
    if(!currentPlayer) throw createError('Current User did not join game')
    if(currentPlayer.isEliminated) throw createError("User has been eliminated and cannot attack")
  
    const players = Game.players.map(player => {
      if(player.userId !== userId && !player.isEliminated){
        const userShip = player.userShip
        let isAttack = checkAttack(userShip,[x,y], Game.ships[0]?.size)
        let isElim = isEliminated(userShip,[x,y],Game.ships[0]?.size)
        if(isAttack && !isElim){
          hit = true;
          const attackedIndex = Math.abs(player.cord - (userShip.isVertical ? y : x))
          const eliminatedArray = userShip.eliminated;
          eliminatedArray[attackedIndex] = 1;
          userShip.eliminated = eliminatedArray;
          if(sumArray(eliminatedArray) >= 4){
            player.isEliminated = true;
            noOfActivePlayers -= 1;
          }
        }
      }
      return player;
    })
    console.log(players);
  }

  if(noOfActivePlayers <= 1) {
    status = 'ended';
    winner = userId;
  }

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    },
    Item: {
      ...documentGetResult.Item, 
      status,
      winner
    }
  });


  return {
    statusCode: 200,
    body: JSON.stringify(
        {
          hit,
          gameOver: Game.status === 'ended',
          winner: Game.status === 'ended' ? Game.winner : false
        },
        null,
        2
    )
  };
};
