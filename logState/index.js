"use strict";

module.exports.handler = async (event) => {
  console.log('new event received');
  console.log(JSON.stringify(event));

  return {
    statusCode: 204
  }
};
