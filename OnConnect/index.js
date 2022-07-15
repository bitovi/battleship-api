 const { validateUserToken } = require('../helpers/webtoken');

module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
    
  
  const parsedToken = validateUserToken(event.headers['Sec-WebSocket-Protocol']);
  console.log('connectionId from onConnect', connectionId);
  console.log('parsedToken from onConnect', JSON.stringify(parsedToken, null, '\t'));  
    

 /*  const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
  })

  if (!documentGetResult.Item) {
    return createError(404, 'game not found');
  }

  if (documentGetResult.Item.gameStarted) {
    return createError(400, 'cannot join a game in progress');
  }

  // Add this new player to the game
  documentGetResult.Item.players.push(createPlayer(false, name, userToken));

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: documentGetResult.Item
  });
 */
  return { 
    statusCode: 200,
  };
};