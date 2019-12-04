const selectors = {
  getMaxModeOn,
}

module.exports = selectors

function getMaxModeOn (state) {
  return state.iTrust.send.maxModeOn
}
