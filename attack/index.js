"use strict";

const { GAMES_TABLE_NAME } = process.env;
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const dynamoClient = require("../common.js").dynamo;
const privateKey = require("../common.js").privateKey;

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

  if(!isAdmin) errorMessage = "Cannot start game, only user that created game has permission";

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
  if (documentGetResult.Item.status === 'ended') throw createError('Game has ended');

  console.log(documentGetResult)
  let currentPlayer;
  const getCurrentPlayer = () =>{
    currentPlayer = documentGetResult.Item.players.filter(player=>{
      player.userId === userId
    })
  }

  if (!documentGetResult.Item) {
    throw createError(500);
  }

  /*
  {
  "hit": true,
  "gameOver": false,
  "winner": false
}
   */
  return {
    statusCode: 200,
    body: JSON.stringify(
        documentGetResult.Item,
        null,
        2
    )
  };
};
