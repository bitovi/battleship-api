"use strict";

module.exports.handler = async (event) => {
  console.log('new event received');
  console.table(event);

  return {
    statusCode: 204
  }
};
