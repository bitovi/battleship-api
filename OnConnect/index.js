 
module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;  
  console.log('connectionId', connectionId);
  return {
    body: connectionId,
    statusCode: 200,
  };
};