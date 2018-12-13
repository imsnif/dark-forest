/* globals experimental */

const { listen } = require('./util/dispatch')
const Store = require('@redom/store')
const { updateGameState } = require('./commands/update-game-state')
const {
  buildingData,
  wonderIndices,
  weaponIndex,
  findItemIndex
} = require('./components/statics')

function verifyPlayerStateChange (oldState, newState) {
  const newTiles = newState.tiles.filter((tile, index) => {
    return oldState.tiles[index].name !== tile.name
  })
  const statDifferences = newTiles.reduce((acc, tile) => {
    const buildingInfo = buildingData[tile.name]
    acc.points += buildingInfo.points
    acc.actions += buildingInfo.actions
    return acc
  }, {points: 0, actions: 0})
  const actionsAreNotNegative = newState.actionsLeft >= 0
  const pointsAreNotNegative = newState.points >= 0
  const enoughActionsWereDetracted =
    oldState.actionsLeft - statDifferences.actions === newState.actionsLeft
  const enoughPointsWereDetracted =
    oldState.points - statDifferences.points === newState.points
  return (
    actionsAreNotNegative &&
    pointsAreNotNegative &&
    enoughActionsWereDetracted &&
    enoughPointsWereDetracted
  )
}

function calculateNextTurnPrediction (state) {
  return state.tiles.reduce((acc, tile) => {
    const buildingInfo = buildingData[tile.name]
    Object.keys(buildingInfo.gain || {}).forEach(resource => {
      const pointCount = buildingInfo.gain[resource]
      acc[resource].gain += pointCount
    })
    Object.keys(buildingInfo.loss || {}).forEach(resource => {
      const pointCount = buildingInfo.loss[resource]
      acc[resource].loss += pointCount
    })
    return acc
  }, {
    points: { gain: 0, loss: 0 },
    fusion: { gain: 0, loss: 0 },
    antimatter: { gain: 0, loss: 0 },
    gw: { gain: 0, loss: 0 }
  })
}

module.exports = async (app, selfArchive) => {
  const store = new Store()
  let updating
  const set = (path, value) => { // TODO: change name to setUi
    store.set(path, value)
    updating || (updating = window.requestAnimationFrame(() => {
      updating = false
      app.update(store.get())
    }))
  }
  const resetUi = () => {
    set('selectedBuilding', null)
  }

  const getCurrentPlayerState = async () => {
    try {
      const state = await selfArchive.readFile('/state.json')
      return JSON.parse(state)
    } catch (e) {
      console.error('failed to getCurrentPlayerState', e)
    }
  }
  const setCurrentPlayerState = async newState => {
    try {
      const nextTurnPredictionInfo = calculateNextTurnPrediction(newState)
      await selfArchive.writeFile('/state.json', JSON.stringify(
        newState
      ))
      set('currentPlayer', newState)
      set('nextTurnPredictionInfo', nextTurnPredictionInfo)
    } catch (e) {
      console.error('failed to setCurrentPlayerState', e)
      // TBD
    }
  }

  const emptyTiles = Array(5).fill({name: 'empty'})
  const initialCurrentPlayerState = {
    name: 'current',
    actionsLeft: 2,
    points: 410,
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
  await setCurrentPlayerState(initialCurrentPlayerState)
  store.set('opponents', opponents)
  store.set('converter1', initialConverterState)
  store.set('converter2', initialConverterState)
  store.set('converter3', initialConverterState)
  store.set('time', '01:00')
  store.set('nextTurnPredictionInfo.points.gain', 0)
  store.set('nextTurnPredictionInfo.points.loss', 0)
  store.set('nextTurnPredictionInfo.fusion.gain', 0)
  store.set('nextTurnPredictionInfo.fusion.loss', 0)
  store.set('nextTurnPredictionInfo.antimatter.gain', 0)
  store.set('nextTurnPredictionInfo.antimatter.loss', 0)
  store.set('nextTurnPredictionInfo.gw.gain', 0)
  store.set('nextTurnPredictionInfo.gw.loss', 0)
  app.update(store.get())

  listen(app, {
    selectBuilding: async function selectBuilding (name) {
      set('selectedBuilding', name)
    },
    placeSelectedBuilding: async function placeSelectedBuilding (tileIndex) {
      const selectedBuilding = store.get('selectedBuilding')
      if (!selectedBuilding) return
      const buildingInfo = buildingData[selectedBuilding.name] // TODO: add to statics

      const playerState = await getCurrentPlayerState()
      const copyWithInsertedTile =
        (tiles, tileToInsert, insertAt) => tiles
          .slice(0, insertAt)
          .concat(tileToInsert)
          .concat(tiles.slice(insertAt + 1))
      const desiredNewState = Object.assign(
        {},
        playerState,
        {
          tiles: copyWithInsertedTile(
            playerState.tiles,
            {name: selectedBuilding.name},
            tileIndex
          ),
          actionsLeft: playerState.actionsLeft - buildingInfo.actions,
          points: playerState.points - buildingInfo.points
        }
      )
      const changePossible = verifyPlayerStateChange(
        playerState,
        desiredNewState
      )
      if (changePossible) {
        await setCurrentPlayerState(desiredNewState)
      }
      resetUi()
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
