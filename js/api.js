/* globals experimental */

const assert = require('assert')
const { listen } = require('./util/dispatch')
const Store = require('@redom/store')
const { updateGameState } = require('./commands/update-game-state')
const {
  buildingData,
  wonderIndices,
  weaponIndex,
  findItemIndex
} = require('./components/statics')
const moment = require('moment')

// TODO: move to statics
const turnDuration = 20
const actionsPerTurn = 2
const energyCaps = {
  fusion: 12,
  antimatter: 6,
  gw: 3
}
const energyMultipliers = {
  fusion: 1,
  antimatter: 5,
  gw: 20
}

function isIdentical (obj1, obj2) {
  try {
    assert.deepEqual(obj1, obj2)
    return true
  } catch (e) {
    return false
  }
}

function newTileDifference (oldState, newState) {
  const newTiles = newState.tiles.filter((tile, index) => {
    return oldState.tiles[index].name !== tile.name
  })
  return newTiles.reduce((acc, tile) => {
    const buildingInfo = buildingData[tile.name]
    acc.pointChange += buildingInfo.points
    acc.actionChange += buildingInfo.actions
    return acc
  }, {pointChange: 0, actionChange: 0})
}

function allEnergyFromConverters(energyType, state) {
  const converters = allConverters(state)
  return converters.reduce((allEnergy, converter) => {
    const energyGain = converter[energyType]
    return allEnergy + energyGain
  }, 0)
}

function cappedEnergyFromConverters (energyType, state) {
  const converters = allConverters(state)
  return converters.reduce((allEnergy, converter) => {
    const energyGain = converter[energyType]
    const cap = energyCaps[energyType]
    return allEnergy + (energyGain > cap ? cap : energyGain)
  }, 0)
}

function allConverters (state) {
  let converters = []
  for (let i = 1; i <= 3; i++) {
    const converter = state[`converter${i}`]
    converters.push(converter)
  }
  return converters
}

function converterDifference (oldState, newState) {
  const energySold = {
    fusion: oldState.fusion - newState.fusion,
    antimatter: oldState.antimatter - newState.antimatter,
    gw: oldState.gw - newState.gw
  }
  const newEnergyInConverters = {
    fusion: allEnergyFromConverters('fusion', newState)  -
      allEnergyFromConverters('fusion', oldState),
    antimatter: allEnergyFromConverters('antimatter', newState)  -
      allEnergyFromConverters('antimatter', oldState),
    gw: allEnergyFromConverters('gw', newState)  -
      allEnergyFromConverters('gw', oldState)
  }
  return { energySold, newEnergyInConverters }
}

function allEnergyIsPositive (state) {
  const energyTypes = ['fusion', 'antimatter', 'gw']
  return energyTypes.every(energyType => state[energyType] >= 0)
}

function verifyPlayerStateChange (oldState, newState) {
  const { pointChange, actionChange } = newTileDifference(oldState, newState)
  const {
    energySold,
    newEnergyInConverters
  } = converterDifference(oldState, newState)
  const allEnergyInConvertersWasSold = isIdentical(
    energySold,
    newEnergyInConverters
  )
  const energyInConvertersIsNotNegative = allConverters(newState).every(
    converter => allEnergyIsPositive(converter)
  )
  const energyIsNotNegative = allEnergyIsPositive(newState)
  const enoughActionsWereDetracted =
    oldState.actionsLeft - actionChange === newState.actionsLeft
  const enoughPointsWereDetracted =
    oldState.points - pointChange === newState.points
  const actionsAreNotNegative = newState.actionsLeft >= 0
  const pointsAreNotNegative = newState.points >= 0
  return (
    energyInConvertersIsNotNegative &&
    energyIsNotNegative &&
    allEnergyInConvertersWasSold &&
    enoughActionsWereDetracted &&
    enoughPointsWereDetracted &&
    actionsAreNotNegative &&
    pointsAreNotNegative
  )
}

function extractConverters (state) {
  let converters = []
  for (let i = 1; i <= 3; i++) {
    converters.push(state[`converter${i}`])
  }
  return converters
}

function minZero (points) {
  return points && points > 0 ? points : 0
}

function predictEnergyGain (state) {
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
    fusion: { gain: 0, loss: 0 },
    antimatter: { gain: 0, loss: 0 },
    gw: { gain: 0, loss: 0 }
  })
}

function predictPointGain (state) {
  const converters = extractConverters(state)
  const fusionSold = cappedEnergyFromConverters('fusion', state)
  const antimatterSold = cappedEnergyFromConverters('antimatter', state)
  const gwSold = cappedEnergyFromConverters('gw', state)
  const pointsFromFusion = fusionSold * energyMultipliers.fusion
  const pointsFromAntimatter = antimatterSold * energyMultipliers.antimatter
  const pointsFromGw = gwSold * energyMultipliers.gw
  return {
    gain: minZero(pointsFromFusion) +
      minZero(pointsFromAntimatter) +
      minZero(pointsFromGw),
    loss: 0
  }
}

function calculateNextTurnPrediction (state) {
  const energyPrediction = predictEnergyGain(state)
  const pointPrediction = predictPointGain(state)
  return {
    fusion: energyPrediction.fusion,
    antimatter: energyPrediction.antimatter,
    gw: energyPrediction.gw,
    points: pointPrediction
  }
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
  const initialConverterState = {
    fusion: 0,
    antimatter: 0,
    gw: 0
  }
  const initialCurrentPlayerState = {
    name: 'current',
    actionsLeft: actionsPerTurn,
    points: 0,
    fusion: 0,
    antimatter: 0,
    gw: 0,
    tiles: emptyTiles,
    converter1: initialConverterState,
    converter2: initialConverterState,
    converter3: initialConverterState
  }
  // ###################### <placeholder game state> ##########################
  const opponents = [ // TODO: this is just a placeholder
    {
      name: 'one',
      actionsLeft: actionsPerTurn,
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
      actionsLeft: actionsPerTurn,
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
      actionsLeft: actionsPerTurn,
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
      actionsLeft: actionsPerTurn,
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
  const formatToCountdown = seconds => {
    const formatted = moment.duration(seconds * 1000)
    const formattedMinutes = String(formatted.minutes()).padStart(2, '0')
    const formattedSeconds = String(formatted.seconds()).padStart(2, '0')
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const endTurn = async function endTurn () {
    const currentPlayerState = await getCurrentPlayerState()
    const nextTurnPredictionInfo =
      calculateNextTurnPrediction(currentPlayerState)
    const nextState = Object.assign(
      {},
      currentPlayerState,
      Object.keys(nextTurnPredictionInfo).reduce((pointsAndEnergy, metric) => {
        const { gain, loss } = nextTurnPredictionInfo[metric]
        const total = Number(gain) - Number(loss)
        pointsAndEnergy[metric] = Number(currentPlayerState[metric]) + total
        return pointsAndEnergy
      }, {}),
      {
        converter1: initialConverterState,
        converter2: initialConverterState,
        converter3: initialConverterState,
        actionsLeft: actionsPerTurn
      }
    )
    await setCurrentPlayerState(nextState)
    startClock()
  }
  const clockTick = async function clockTick () {
    let secondsUntilTurnEnd
    try {
      let stored = Number(await selfArchive.readFile('secondsUntilTurnEnd'))
      if (stored === 0) {
        return endTurn()
      }
      if (!Number.isInteger(stored) || stored > turnDuration || stored < 0) {
        throw new Error('invalid secondsUntilTurnEnd')
      } else {
        secondsUntilTurnEnd = stored
      }
    } catch (e) {
      secondsUntilTurnEnd = turnDuration + 1
    }
    const decremented = secondsUntilTurnEnd - 1
    const formattedTime = formatToCountdown(decremented)
    await selfArchive.writeFile('/secondsUntilTurnEnd', String(decremented))
    set('time', formattedTime) // TODO: moment format
    setTimeout(clockTick, 1000)
  }
  const startClock = async function startClock () {
    const newDuration = String(turnDuration)
    const formattedTime = formatToCountdown(newDuration)
    await selfArchive.writeFile('secondsUntilTurnEnd', newDuration)
    set('time', formattedTime)
    setTimeout(clockTick, 1000)
  }
  store.set('opponents', opponents)
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
  await startClock()

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
    sellEnergy: async function sellEnergy ({energyType, converterIndex, amount}) {
      const playerState = await getCurrentPlayerState()
      const converterName = `converter${converterIndex}`
      const currentEnergySold = playerState[converterName][energyType]
      const currentEnergyAvailable = playerState[energyType]
      const desiredNewState = Object.assign(
        {},
        playerState,
        {
          [converterName]: Object.assign({}, playerState[converterName], {
            [energyType]: currentEnergySold + amount
          }),
          [energyType]: currentEnergyAvailable - amount
        }
      )
      const changePossible = verifyPlayerStateChange(
        playerState,
        desiredNewState
      )
      if (changePossible) {
        await setCurrentPlayerState(desiredNewState)
      }
    }
  })

//  await experimental.datPeers.setSessionData(selfArchive.url)
//
//  await selfArchive.writeFile('/state.json', JSON.stringify(initialState))
//  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
//  updateGameState(selfArchive, set) // TODO: promise, error, etc.
}
