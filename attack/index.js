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

module.exports.handler = async (event) => {
  let body;
  let header;
  try {
    body = JSON.parse(event.body);
    header = event.headers;

  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Bad Request"
      })
    }
  }
  const payload = jwt.verify(header.authorization, privateKey);

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

  let Game = documentGetResult.Item
  let {
    players,
    activePlayers: noOfActivePlayers,
    status,
    winner,
    ships
  } = Game
  let shipSize = ships[0]?.size;
  let hit = false;
  let noOfHits = 0;

  if(status === 'pending') throw createError("Game has not been started"); 
  if(noOfActivePlayers <= 1 ) throw createError("Only one player cannot start a game"); 
  const currentPlayer = players.filter(player => player.userId === userId)
  
  if (status !== 'ended') {
    //check if player is eliminated
    if(!currentPlayer) throw createError('Current User did not join game')
    if(currentPlayer.isEliminated) throw createError("User has been eliminated and cannot attack")

    const updtedPlayers = Game.players.map(player => {
      if(player.userId !== userId && !player.isEliminated){
        const userShip = player.ship
        let isAttack = checkAttack(userShip,[x,y], shipSize)
        let isElim = isEliminated(userShip,[x,y],shipSize)
        if(isAttack && !isElim){
          hit = true;
          noOfHits += 1;
          const attackedIndex = Math.abs(userShip.cord - (userShip.isVertical ? y : x))
          const eliminatedArray = userShip.eliminated;
          eliminatedArray[attackedIndex] = 1;
          userShip.eliminated = eliminatedArray;
          if(sumArray(eliminatedArray) >= shipSize){
            player.isEliminated = true;
            noOfActivePlayers -= 1;
          }
        }
      }
      return player;
    })
    players = updtedPlayers;

    if(noOfActivePlayers <= 1) {
      status = 'ended';
      winner = currentPlayer.name;
    }
    
    await dynamoClient.put({
      TableName: GAMES_TABLE_NAME,
      Key: {
        id: gameId
      },
      Item: {
        ...documentGetResult.Item,
        players,
        status,
        winner
      }
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
        {
          hit,
          gameOver: status === 'ended',
          winner,
          noOfHits,
        },
        null,
        2
    )
  };
};
