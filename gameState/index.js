"use strict";

const { GAMES_TABLE_NAME } = process.env;
const { createError } = require("../helpers/error");
const { dynamoClient } = require("../helpers/dynamodb");
const { ApiGatewayManagementApi } = require("@aws-sdk/client-apigatewaymanagementapi");

const sendMessageToClient = (url, connectionId, payload) =>
  new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new  ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: url,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.log('err is', err);
          reject(err);
        }
        resolve(data);
      }
    );
  });


module.exports.handler = async (event) => { 
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const callbackUrlForAWS =/*  `ws://${domain}/${stage}` */`ws://localhost:3001`

 

  const { gameId } = event.queryStringParameters

  if (!gameId) {
    return createError(400, 'gameId is required');
  }

  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  })

  if (!documentGetResult.Item) {
    return createError(404, 'game not found');
  }



  if (documentGetResult.Item.players.length > 0) {
    documentGetResult.Item.players.forEach((player) => {
      delete player.token;
    });
  }


  await Promise.all(documentGetResult.Item.connections.map(connectionId => sendMessageToClient(callbackUrlForAWS, connectionId, documentGetResult.Item)))

  return {
    statusCode: 200,
    body: JSON.stringify(
      documentGetResult.Item,
      null,
      2
    )
  }
};
