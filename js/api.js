/* globals experimental */

const { listen } = require('./util/dispatch')
const Store = require('@redom/store')
const { updateGameState } = require('./commands/update-game-state')

module.exports = async (app, selfArchive) => {
  const store = new Store()
  let updating
  const set = (path, value) => {
    store.set(path, value)
    updating || (updating = window.requestAnimationFrame(() => {
      updating = false
      app.update(store.get())
    }))
  }

  const initialState = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  listen(app, {
    switch: async (data) => {
      const { source, destination } = data
      const currentPlayerIndex = JSON.stringify(store.get('currentPlayerIndex'))
      let players = store.get('players')
      const sourceEl = players[currentPlayerIndex][source]
      const destinationEl = players[currentPlayerIndex][destination]
      players[currentPlayerIndex][source] = destinationEl
      players[currentPlayerIndex][destination] = sourceEl
      set('players', players) // optimistic update
      await selfArchive.writeFile('/state.json', JSON.stringify(
        players[currentPlayerIndex]
      ))
    },
    action: async (data) => {
      const currentPlayerIndex = JSON.stringify(store.get('currentPlayerIndex'))
      let players = store.get('players')
      const freePosition = players[currentPlayerIndex].indexOf(0)
      if (freePosition > -1) {
        players[currentPlayerIndex][freePosition] = data.actionIndex
        set('players', players) // optimistic update
        await selfArchive.writeFile('/state.json', JSON.stringify(
          players[currentPlayerIndex]
        ))
      }
    }
  })

  await experimental.datPeers.setSessionData(selfArchive.url)

  await selfArchive.writeFile('/state.json', JSON.stringify(initialState))
  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
  updateGameState(selfArchive, store, set) // TODO: promise, error, etc.
}
