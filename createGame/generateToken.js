const { JWT_SECRET_KEY } = process.env;
const { faker } = require('@faker-js/faker');
const jwt = require('jsonwebtoken');

function generateJWTToken(payload = {}) {
    var token = jwt.sign(payload, JWT_SECRET_KEY);
    return token;
}

function createUser({ gameId, name }) {
    const userId = faker.datatype.uuid();
    let specialName = name ? name : faker.animal.type().toUpperCase();
    const userName = faker.word.adjective().toUpperCase() + ' ' + specialName + ' '+ faker.music.songName().toUpperCase();
    let jwtToken = generateJWTToken({ gameId, userName, userId }); 
    return jwtToken;
}

module.exports = createUser;