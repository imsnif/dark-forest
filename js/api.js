/* globals experimental */

const { listen } = require('./util/dispatch')
const Store = require('@redom/store')
const { updateGameState } = require('./commands/update-game-state')
const { wonderIndices, weaponIndex, findItemIndex } = require('./components/statics')

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

  const initialCurrentPlayerState = {
    name: 'current',
    actionsLeft: 2,
    points: 234,
    fusion: 0,
    antimatter: 0,
    gw: 0
  }
  // ###################### <placeholder game state> ##########################
  const opponents = [ // TODO: this is just a placeholder
    {
      name: 'one',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12
    },
    {
      name: 'two',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12
    },
    {
      name: 'three',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12
    },
    {
      name: 'four',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12
    }
  ]
  // ###################### </placeholder game state> ##########################
  store.set('currentPlayer', initialCurrentPlayerState)
  store.set('opponents', opponents)
  app.update(store.get())

  listen(app, {
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
    },
    build: async (data) => {
      const {nextIndex, era} = data
      const currentPlayerIndex = JSON.stringify(store.get('currentPlayerIndex'))
      let players = store.get('players')
      const currentDestructionScore = store.get('destructionScore') || 0
      const currentWinScore = store.get('winScore') || 0
      const freePosition = players[currentPlayerIndex].indexOf(0)
      if (freePosition > -1) {

        players[currentPlayerIndex][freePosition] = findItemIndex(era, nextIndex)

        const adjacentPlayerLeft =
          currentPlayerIndex - 1 >= 0
            ? players[currentPlayerIndex - 1]
            : players.length > 1
            ? players[players.length - 1]
            : null
        const adjacentPlayerRight =
          currentPlayerIndex + 1 < players.length
            ? players[currentPlayerIndex + 1]
            : players.length > 1
            ? players[0]
            : null
        let destroyedCount = 0
        if (
          adjacentPlayerLeft &&
          wonderIndices.includes(adjacentPlayerLeft[freePosition]) &&
          // flatList[adjacentPlayerLeft[freePosition]].type === 'wonder' &&
          findItemIndex(era, nextIndex) === weaponIndex
          // flatList[data].type === 'weapon'
        ) {
          destroyedCount += 1
        }
        if (
          adjacentPlayerRight &&
          wonderIndices.includes(adjacentPlayerRight[freePosition]) &&
          // flatList[adjacentPlayerRight[freePosition]].type === 'wonder' &&
          findItemIndex(era, nextIndex) === weaponIndex
          // flatList[data].type === 'weapon'
        ) {
          destroyedCount += 1
        }
        if (destroyedCount > players.length - 1) {
          destroyedCount = players.length - 1
          // in this case, both adjacent players are identical, this is an ugly
          // quick hack and we need to properly get adjacent players instead
        }
        const wonderCount = players[currentPlayerIndex]
          .filter(e => wonderIndices.includes(e)).length
        // if (flatList[data].type === 'wonder' && wonderCount === 3) {
        if (wonderIndices.includes(findItemIndex(era, nextIndex)) && wonderCount === 3) {
          set('winScore', currentWinScore + 1)
        }
        set('players', players) // optimistic update
        set('destructionScore', currentDestructionScore + destroyedCount)
        // ^^ ui only state
        await selfArchive.writeFile('/state.json', JSON.stringify(
          players[currentPlayerIndex]
        ))
      }
    }
  })

//  await experimental.datPeers.setSessionData(selfArchive.url)
//
//  await selfArchive.writeFile('/state.json', JSON.stringify(initialState))
//  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
//  updateGameState(selfArchive, set) // TODO: promise, error, etc.
}
