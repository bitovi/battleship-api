const { faker } = require('@faker-js/faker');
const jwt = require('jsonwebtoken');

function generateJWTToken(payload = {}) {
    var token = jwt.sign(payload, "MR_ROBOTO_BY_STYX");
    return token;
}

function createUser({ gameId }) {
    const userId = faker.datatype.uuid();
    const userName = faker.word.adjective().toUpperCase() + ' ' + faker.animal.type().toUpperCase() + ' '+ faker.music.songName().toUpperCase();
    var jwtToken = generateJWTToken({ gameId, userName, userId }); 
    return jwtToken;
}

module.exports = createUser;