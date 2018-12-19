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

function predictEnergyGain (state, leftOpponents, rightOpponents) {
  return state.tiles.reduce((acc, tile, index) => {
    const buildingInfo = buildingData[tile.name]
    const neighboringBuildings = [
      leftOpponents[0] ? leftOpponents[0].tiles[index] : {},
      rightOpponents[0] ? rightOpponents[0].tiles[index] : {}
    ]
    const neighboringWormholes = neighboringBuildings.filter(
      b => b && b.name === 'wormhole'
    )
    if (tile.name === 'wormhole') {
      neighboringBuildings.forEach(neighboringTile => {
        if (!neighboringTile) return
        const neighboringBuildingInfo = buildingData[neighboringTile.name]
        if (neighboringBuildingInfo) {
          Object.keys(neighboringBuildingInfo.gain || {}).forEach(resource => {
            acc[resource].gain += Math.ceil(neighboringBuildingInfo.gain[resource] / 2)
          })
        }
      })
      return acc
    } else {
      Object.keys(buildingInfo.gain || {}).forEach(resource => {
        const pointCount = buildingInfo.gain[resource] -
          (neighboringWormholes.length * (buildingInfo.gain[resource] / 2))
        acc[resource].gain += pointCount
      })
      Object.keys(buildingInfo.loss || {}).forEach(resource => {
        const pointCount = buildingInfo.loss[resource]
        acc[resource].loss += pointCount
      })
      return acc
    }
  }, {
    fusion: { gain: 0, loss: 0 },
    antimatter: { gain: 0, loss: 0 },
    gw: { gain: 0, loss: 0 }
  })
}


function resolveResourceInConverter (
  currentPlayerConverter, opponentConverters, energyType
) {
  const cap = energyCaps[energyType]
  const multiplier = energyMultipliers[energyType]
  const currentPlayerBid = currentPlayerConverter[energyType]
  const totalBids = currentPlayerBid + opponentConverters.reduce((total, c) => {
    return total + (c && c[energyType] ? c[energyType] : 0)
  }, 0)
  if (totalBids <= cap) {
    return currentPlayerBid * multiplier
  } else {
    const currentPlayerShare = Math.ceil((currentPlayerBid / totalBids) * cap)
    return Math.ceil(currentPlayerShare * multiplier)
  }
}

function resolveConverter (currentPlayerConverter, opponentConverters) {
  const pointsFromFusion = resolveResourceInConverter(
    currentPlayerConverter,
    opponentConverters,
    'fusion'
  )
  const pointsFromAntimatter = resolveResourceInConverter(
    currentPlayerConverter,
    opponentConverters,
    'antimatter'
  )
  const pointsFromGw = resolveResourceInConverter(
    currentPlayerConverter,
    opponentConverters,
    'gw'
  )
  return pointsFromFusion + pointsFromAntimatter + pointsFromGw
}

function predictPointGain (state, leftOpponents, rightOpponents) {
  const currentPlayerConverters = extractConverters(state)
  const leftOpponentsConverters = leftOpponents.map(
    o => extractConverters(o)
  )
  const rightOpponentsConverters = rightOpponents.map(
    o => extractConverters(o)
  )
  const leftConverterResults = resolveConverter(currentPlayerConverters[0], [
    leftOpponents[1] ? leftOpponentsConverters[1][2] : {},
    leftOpponents[0] ? leftOpponentsConverters[0][1] : {}
  ])
  const currentPlayerConverterResults = resolveConverter(currentPlayerConverters[1], [
    leftOpponents[0] ? leftOpponentsConverters[0][2] : {},
    rightOpponents[0] ? rightOpponentsConverters[0][0] : {}
  ])
  const rightConverterResults = resolveConverter(currentPlayerConverters[2], [
    rightOpponents[0] ? rightOpponentsConverters[0][1] : {},
    rightOpponents[1] ? rightOpponentsConverters[1][0] : {}
  ])
  return {
    gain: leftConverterResults +
      currentPlayerConverterResults +
      rightConverterResults,
    loss: 0
  }
}

function calculateNextTurnPrediction (state, leftOpponents, rightOpponents) {
  const energyPrediction = predictEnergyGain(
    state,
    leftOpponents || [],
    rightOpponents || []
  )
  const pointPrediction = predictPointGain(
    state,
    leftOpponents || [],
    rightOpponents || []
  )
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
      // TODO: also pass leftOpponents and rightOpponents to
      // calculateNextTurnPrediction
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
  await setCurrentPlayerState(initialCurrentPlayerState)
  const formatToCountdown = seconds => {
    const formatted = moment.duration(seconds * 1000)
    const formattedMinutes = String(formatted.minutes()).padStart(2, '0')
    const formattedSeconds = String(formatted.seconds()).padStart(2, '0')
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const writeEndTurnState = function writeEndTurnState (state) {
    return selfArchive.writeFile('/endTurnState', JSON.stringify(
      Object.assign({}, state, {updatedTime: Date.now()})
    ))
  }
  const getEndTurnState = async function getEndTurnState (id) {
    if (!id) return {}
    try {
      const peerArchive = await DatArchive.load(id)
      const endTurnState = JSON.parse(
        await peerArchive.readFile('/endTurnState')
      )
      const peerTimestamp = await peerArchive.readFile('/timestamp')
      if (Number(endTurnState.updatedTime) < (Number(peerTimestamp) - 5000)) {
        // this number is arbitrary
        throw new Error('peer has not updated their end turn state yet')
      }
      return endTurnState
    } catch (e) {
      console.warn(e)
      await new Promise(resolve => setTimeout(resolve, 500)) // arbitrary num
      // TODO: timeout and kick (blacklist?) peer
      return getEndTurnState(id)
    }
  }

  const endTurn = async function endTurn () {
    const currentPlayerState = await getCurrentPlayerState()
    await writeEndTurnState(currentPlayerState)
    const leftOpponentIds = store.get('leftOpponentIds') || []
    const rightOpponentIds = store.get('rightOpponentIds') || []
    const [
      selfEndTurnState,
      leftOpponentsEndTurnStates,
      rightOpponentsEndTurnStates
    ] = await Promise.all([
      getEndTurnState(selfArchive.url),
      Promise.all(leftOpponentIds.map(id => getEndTurnState(id))),
      Promise.all(rightOpponentIds.map(id => getEndTurnState(id)))
    ])
    const nextTurnPredictionInfo = calculateNextTurnPrediction(
      selfEndTurnState,
      leftOpponentsEndTurnStates,
      rightOpponentsEndTurnStates
    )
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
  store.set('leftOpponents', [])
  store.set('rightOpponents', [])
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
  // findPeers(selfArchive)

  await experimental.datPeers.setSessionData(selfArchive.url)

  // await selfArchive.writeFile('/state.json', JSON.stringify(initialState))
  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
  updateGameState(selfArchive, set) // TODO: promise, error, etc.
}
