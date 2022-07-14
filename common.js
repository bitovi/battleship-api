const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const { AWS_REGION, AWS_DYNAMO_ENDPOINT } = process.env;

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

module.exports = { dynamoClient};