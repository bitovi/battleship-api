const { SecretsManager } = require("@aws-sdk/client-secrets-manager");
const { credentialProvider } = require("./aws-credentials");
const { AWS_REGION } = process.env;
const { createError } = require("../helpers/error");

const secretsCache = {};

const secretsManager = new SecretsManager({
    region: AWS_REGION,
    credentialDefaultProvider: credentialProvider
});

async function getSecret(secretArn) {
    if (secretsCache[secretArn]) {
        return secretsCache[secretArn];
    }
    console.log("JWT_KEY_PAIR_ARN", {
        SecretId: secretArn
    });
    const secretValue = await secretsManager.getSecretValue({
        SecretId: secretArn
    });
    if (!secretValue.SecretString) {
        throw new Error("SecretString doesn't exist!");
    }
    secretsCache[secretArn] = secretValue.SecretString;

    return secretValue.SecretString;
}

async function getSecretFromEnvironment(name) {
    const arnName = `${name}_ARN`
    if (process.env[arnName]) {
        const secret = await getSecret(arnName);
        return secret;
    }
    if (process.env[name]) {
        return process.env[name];
    }
    throw new Error("env var doesn't exist!");
}

module.exports = {
    getSecret,
    getSecretFromEnvironment
}