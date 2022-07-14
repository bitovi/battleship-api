"use strict";

const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { AWS_REGION, AWS_DYNAMO_ENDPOINT } = process.env;

function isVerticalCheck(coords) {
    return coords[0].y === coords[1].y;
}

function isOutOfBound(coords, gridSize) {
    return coords[0].x <= 0 || coords[1].x >= gridSize || coords[0].y <= 0 || coords[1].y >= gridSize
}

function isGreaterThanShipSize(coords, shipSize) {
    return Math.abs(coords[0].x-coords[1].x) !==  shipSize|| Math.abs(coords[0].y-coords[1].y) !==  shipSize
}

function getVaryingCord(coords, isVertical){
    const s = isVertical ? 'y' : 'x';
    return coords[0][s] < coords[1][s] ? coords[0][s] : coords[1][s];
}
function checkAttack(ship, place, shipSize) {
    const x = place[0];
    const y = place[1];
    const staticCord = ship.isVertical ? y : x;
    const cord = ship.isVertical ? x : y;
    if(staticCord !== ship.staticCord) return false;
    return shipSize > Math.abs(cord - ship.varyingCord);
}
function isEliminated(ship, place, shipSize) {
    const x = place[0];
    const y = place[1];
    const staticCord = ship.isVertical ? y : x;
    const cord = ship.isVertical ? x : y;
    if(staticCord !== ship.staticCord) return false;
    const sub = Math.abs(cord - ship.varyingCord);
    if(sub > shipSize) return false;
    return ship.eliminated[sub] === 1;
}

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




module.exports.dynamo = DynamoDBDocument.from(new DynamoDB({
    region: AWS_REGION,
    ...configuration,
}));

module.exports.privateKey = "fish";
module.exports = {
    isVerticalCheck,
    isOutOfBound,
    isGreaterThanShipSize,
    isEliminated,
    getVaryingCord,
    checkAttack
}