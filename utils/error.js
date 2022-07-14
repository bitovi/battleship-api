module.exports = function error(statusCode, message) {
  return {
    statusCode,
    body: JSON.stringify({ message }, null, '\t'),
  };
};
