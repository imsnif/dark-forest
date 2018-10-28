/* globals experimental DatArchive */
const { flatList } = require('../components/statics')

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
        flatList[actionIndex].type === 'wonder' &&
        (
          flatList[adjacentPlayerRight[eraIndex]].type === 'weapon' ||
          flatList[adjacentPlayerLeft[eraIndex]].type === 'weapon'
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
    const wonderCount = state.filter(e => flatList[e].type === 'wonder')
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
          const [state, timestamp] = await Promise.all([
            archive.readFile('/state.json'),
            archive.readFile('/timestamp')
          ])
          const url = archive.url
          return {
            state: JSON.parse(state),
            timestamp,
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
  const gameState = calculateGameState(activePlayers, selfArchive.url)
  const currentPlayerState = gameState.players[gameState.currentPlayerIndex]
  setUiState('players', gameState.players)
  setUiState('currentPlayerIndex', gameState.currentPlayerIndex)
  setUiState('winners', gameState.winners)
  await selfArchive.writeFile(
    '/state.json', JSON.stringify(currentPlayerState)
  )
  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
  setTimeout(() => updateGameState(selfArchive, setUiState), 500)
}

module.exports = { updateGameState }
