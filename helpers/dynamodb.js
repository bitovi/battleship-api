const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { credentialProvider } = require("./aws-credentials");

const { AWS_REGION, AWS_DYNAMO_ENDPOINT } = process.env;

const dynamoClient = DynamoDBDocument.from(new DynamoDB({
    region: AWS_REGION,
    credentialDefaultProvider: credentialProvider,
    ...(AWS_DYNAMO_ENDPOINT && { endpoint: AWS_DYNAMO_ENDPOINT }),
  }));

module.exports = { dynamoClient};