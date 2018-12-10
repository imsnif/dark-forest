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

  const emptyTiles = Array(5).fill({name: 'empty'})
  const initialCurrentPlayerState = {
    name: 'current',
    actionsLeft: 2,
    points: 500,
    fusion: 0,
    antimatter: 0,
    gw: 0,
    tiles: emptyTiles
  }
  const initialConverterState = {
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
      gw: 12,
      tiles: [
        { name: 'fusion' },
        { name: 'wormhole' },
        { name: 'empty' },
        { name: 'empty' },
        { name: 'fusion' }
      ]
    },
    {
      name: 'two',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12,
      tiles: [
        { name: 'gw' },
        { name: 'antimatter' },
        { name: 'empty' },
        { name: 'wormhole' },
        { name: 'empty' }
      ]
    },
    {
      name: 'three',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12,
      tiles: [
        { name: 'empty' },
        { name: 'empty' },
        { name: 'wormhole' },
        { name: 'wormhole' },
        { name: 'fusion' }
      ]
    },
    {
      name: 'four',
      actionsLeft: 2,
      points: 123,
      fusion: 1,
      antimatter: 50,
      gw: 12,
      tiles: [
        { name: 'gw' },
        { name: 'empty' },
        { name: 'gw' },
        { name: 'empty' },
        { name: 'fusion' }
      ]
    }
  ]
  // ###################### </placeholder game state> ##########################
  store.set('currentPlayer', initialCurrentPlayerState)
  store.set('opponents', opponents)
  store.set('converter1', initialConverterState)
  store.set('converter2', initialConverterState)
  store.set('converter3', initialConverterState)
  app.update(store.get())

  listen(app, {
    selectBuilding: async function selectBuilding (name) {
      set('selectedBuilding', name)
    },
    placeSelectedBuilding: async function placeSelectedBuilding (tileIndex) {
//      const currentPoints = store.get('currentPlayer.points')
//      const actionsLeft = store.get('currentPlayer.actionsLeft')
      const currentTiles = store.get('currentPlayer.tiles')
      const selectedBuilding = store.get('selectedBuilding')
      const newTiles = currentTiles.slice(0, tileIndex).concat({
        name: selectedBuilding ? selectedBuilding.name : 'empty'
      }).concat(currentTiles.slice(tileIndex + 1))
      set('selectedBuilding', null) // TODO: move to reset ui state or smth
      set('currentPlayer.tiles', newTiles)
//      set(
//        'currentPlayer.points',
//        Number(currentPoints) - Number(selectedBuilding.points)
//      )
//      set(
//        'currentPlayer.actionsLeft',
//        Number(actionsLeft) - Number(selectedBuilding.actions)
//      )
      // TODO: move currentPlayer manipulation to game state, leave as
      // optimistic update here
    },
    openConverterModal: function openConverterModal (indexOnBoard) {
      set('converterModalOpen', indexOnBoard)
    },
    sellEnergy: function sellEnergy ({energyType, converterIndex, amount}) {
      const currentEnergyForSale = store.get(`converter${converterIndex}`)
      const newEnergyForSale = Object.assign({}, currentEnergyForSale, {
        [energyType]: currentEnergyForSale[energyType] + amount
      })
      set(`converter${converterIndex}`, newEnergyForSale)
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
