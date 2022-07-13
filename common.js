"use strict";

const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { AWS_REGION } = process.env;

const credentialProvider = defaultProvider({
    roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});

const options = {
    credentialProviderDefault: credentialProvider,
    region: AWS_REGION
}

if (process.env.IS_OFFLINE) {
    options.endpoint = "http://localhost:8000"
}


module.exports.dynamo = DynamoDBDocument.from(new DynamoDB(options));
module.exports.options = options;


module.exports.privateKey = "fish";