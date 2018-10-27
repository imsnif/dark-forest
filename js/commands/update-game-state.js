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

function currentPlayerReducer (players, currentPlayerUrl) {
  return players.map(p => p.url).indexOf(currentPlayerUrl)
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

async function updateGameState (selfArchive, store, set) {
  await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
  const peers = await experimental.datPeers.list()
  const peerArchives = await Promise.all(
    peers.filter(p => p.sessionData).map(p => DatArchive.load(p.sessionData))
  )
  const allArchives = peerArchives.concat(selfArchive)
  const activePlayers = (await Promise.all(allArchives.map(
    async archive => {
      try {
        const [stateFile, timestamp] = await Promise.all([
          archive.readFile('/state.json'),
          archive.readFile('/timestamp')
        ])
        // this number is arbitrary
        if ((Number(timestamp) + 1500) < Date.now()) {
          return false
        }
        const state = JSON.parse(stateFile)
        // TODO:
        // 1. make sure state is array of 12 numbers
        // 2. make sure does not have card more than once
        // 3. make sure does not have wonder without supporting tech
        return {
          state,
          url: archive.url
        }
      } catch (e) {
        return false
      }
    }
  ))).filter(Boolean)
  const players = playersReducer(activePlayers)
  const currentPlayerIndex = currentPlayerReducer(activePlayers, selfArchive.url)
  const winners = winnersReducer(players)
  const currentPlayerState = players[currentPlayerIndex]
  set('players', players)
  set('currentPlayerIndex', currentPlayerIndex)
  set('winners', winners)
  await selfArchive.writeFile(
    '/state.json', JSON.stringify(currentPlayerState)
  )
  setTimeout(() => updateGameState(selfArchive, store, set), 500)
}

module.exports = { updateGameState }
