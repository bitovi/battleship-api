"use strict";
 
module.exports.handler = async (event) => { 
    return {
        body: "helloHandler",
        statusCode: 200
    }
};
