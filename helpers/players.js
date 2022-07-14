function createPlayer(isAdmin, name, token) {
  return {
    isAdmin,
    name,
    token,
    userGrid: {},
    shipCount: 0
  }
}

module.exports = { createPlayer };