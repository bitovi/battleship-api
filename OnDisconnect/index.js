module.exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId; 

  return {
    body: connectionId,
    statusCode: 200,
  };
};