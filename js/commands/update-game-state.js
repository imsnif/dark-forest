/* globals experimental DatArchive */
const { wonderIndices, weaponIndex } = require('../components/statics')

function playersReducer (activePlayers) {
  const validSortedStates = activePlayers.sort((a, b) => {
    return ('' + a.url).localeCompare(b.url)
  })
  return validSortedStates.map(({state, url}, index) => {
    const adjacentPlayerLeft = index === 0
      ? validSortedStates[validSortedStates.length - 1].state
      : validSortedStates[index - 1].state
    const adjacentPlayerRight = index === (validSortedStates.length - 1)
      ? validSortedStates[0].state
      : validSortedStates[index + 1].state
    return state.map((actionIndex, eraIndex) => {
      if (
        wonderIndices.includes(actionIndex) &&
        // flatList[actionIndex].type === 'wonder' &&
        (
          adjacentPlayerRight[eraIndex] === weaponIndex ||
          adjacentPlayerLeft[eraIndex] === weaponIndex
//          flatList[adjacentPlayerRight[eraIndex]].type === 'weapon' ||
//          flatList[adjacentPlayerLeft[eraIndex]].type === 'weapon'
        )
      ) {
        return 0
      }
      return actionIndex
    })
  })
}

function currentPlayerReducer (players, playerUrl) {
  return players.map(p => p.url).indexOf(playerUrl)
}

function winnersReducer (players) {
  return players.reduce((winners, state, index) => {
    const wonderCount = state.filter(e => wonderIndices.includes(e))
    if (wonderCount.length === 3) {
      return winners.concat(index)
    }
    return winners
  }, [])
}

async function getPeerArchives () {
  const peers = await experimental.datPeers.list()
  return Promise.all(
    peers.filter(p => p.sessionData).map(p => DatArchive.load(p.sessionData))
  )
}

async function extractStateFromArchives (archives) {
  const allStates = await Promise.all(
    archives.map(
      async archive => {
        try {
          const [state, timestamp, secondsUntilTurnEnd] = await Promise.all([
            archive.readFile('/state.json'),
            archive.readFile('/timestamp'),
            archive.readFile('/secondsUntilTurnEnd')
          ])
          const url = archive.url
          return {
            state: JSON.parse(state),
            timestamp,
            secondsUntilTurnEnd,
            url
          }
        } catch (e) {
          return false
        }
      }
    )
  )
  const readableStates = allStates.filter(Boolean)
  return readableStates
}

function findActivePlayers (playerStates) {
  return playerStates.filter(({timestamp}) => {
    // this number is arbitrary
    return ((Number(timestamp) + 1500) > Date.now())
  })
}

function calculateGameState (activePlayers, playerUrl) {
  const players = playersReducer(activePlayers)
  const currentPlayerIndex = currentPlayerReducer(activePlayers, playerUrl)
  const winners = winnersReducer(players)
  return { players, currentPlayerIndex, winners }
}

async function updateGameState (selfArchive, setUiState) {
  const peerArchives = await getPeerArchives()
  const allArchives = peerArchives.concat(selfArchive)
  const playerStates = await extractStateFromArchives(allArchives)
  const activePlayers = findActivePlayers(playerStates)
  const sortedActivePlayers = activePlayers.sort(
    (a, b) => a.url > b.url ? -1 : 1
  )
  const currentPlayerIndex = sortedActivePlayers.findIndex(
    p => p.url === selfArchive.url
  )
  const currentPlayer = sortedActivePlayers[currentPlayerIndex]
  const leftPlayers = sortedActivePlayers.slice(0, currentPlayerIndex)
  const rightPlayers = sortedActivePlayers.slice(currentPlayerIndex + 1)
  const highestPlayerTime = sortedActivePlayers[0].secondsUntilTurnEnd
  // TODO: adjust time to clock of player on my left (or loop back)
  if (Number(currentPlayer.secondsUntilTurnEnd) !== Number(highestPlayerTime)) {
    // adjust clock
    await selfArchive.writeFile('/secondsUntilTurnEnd', highestPlayerTime)
  }
  setUiState('leftOpponents', leftPlayers.map(o => o.state))
  setUiState('rightOpponents', rightPlayers.map(o => o.state))
  setUiState('leftOpponentIds', leftPlayers.map(o => o.url))
  setUiState('rightOpponentIds', rightPlayers.map(o => o.url))
  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
  setTimeout(() => updateGameState(selfArchive, setUiState), 500)
}

module.exports = { updateGameState }
