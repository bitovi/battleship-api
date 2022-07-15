const { dynamoClient } = require("../helpers/dynamodb"); 
const { GAMES_TABLE_NAME } = process.env; 
const { validateUserToken } = require('../helpers/webtoken');

module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;  

  console.log('connectionId from onConnect', connectionId); 
  const { gameId } = event.queryStringParameters; 

  
  console.log('gameId from onConnect', gameId); 
  
  try {
      const documentGetResult = await dynamoClient.get({
    TableName: GAMES_TABLE_NAME,
    Key: {
      id: gameId
    }
      })
    
      
   console.log('documentGetResult: ', documentGetResult); 
  

  if (!documentGetResult.Item) {
    return createError(404, 'game not found');
  }

  if (documentGetResult.Item.gameStarted) {
    return createError(400, 'cannot join a game in progress');
  }

  // Add this new player to the game
  if(!documentGetResult.Item.connections){
    documentGetResult.Item.connections = []
  }  
  documentGetResult.Item.connections.push(connectionId);

  await dynamoClient.put({
    TableName: GAMES_TABLE_NAME,
    Item: documentGetResult.Item
  });

  
   console.log('documentGetResult: ', documentGetResult); 
  
  return { 
    body: JSON.stringify(documentGetResult.Item, null, '\t'),
    statusCode: 200,
  };
    
  } catch (error) {
    console.log(error)
  }




};