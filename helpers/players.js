function createPlayer(isAdmin, name, token) {
  return {
    isAdmin,
    name,
    token,
    userGrid: {},
    shipCount: 0,
    lastAttackTime: null
  }
}

module.exports = { createPlayer };