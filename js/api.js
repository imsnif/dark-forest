const { listen } = require('./util/dispatch')
const Store = require('@redom/store')
const { flatList } = require('./components/statics')
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
      const myIndex = JSON.stringify(store.get('myIndex'))
      const playerPath = `players.${myIndex}`
      let playerEras = store.get(playerPath)
      const sourceEl = playerEras[source]
      const destinationEl = playerEras[destination]
      playerEras[source] = destinationEl
      playerEras[destination] = sourceEl
      set(playerPath, playerEras) // optimistic update
      await selfArchive.writeFile('/state.json', JSON.stringify(
        playerEras
      ))
    },
    action: async (data) => {
      const myIndex = JSON.stringify(store.get('myIndex'))
      const playerPath = `players.${myIndex}`
      let playerEras = store.get(playerPath)
      const freePosition = playerEras.indexOf(0)
      if (freePosition > -1) {
        console.log('data', data)
        playerEras[freePosition] = data.eraIndex
        set(playerPath, playerEras) // optimistic update
        await selfArchive.writeFile('/state.json', JSON.stringify(
          playerEras
        ))
      }
    }
  })

	await experimental.datPeers.setSessionData(selfArchive.url)

  await selfArchive.writeFile('/state.json', JSON.stringify(initialState))
  updateGameState(selfArchive, store, set) // TODO: promise, error, etc.
}

// async function updateGameState (selfArchive, store, set) {
//   await selfArchive.writeFile('/timestamp', JSON.stringify(Date.now()))
//   const currentPlayers = store.get('players')
//   const peers = await experimental.datPeers.list()
//   const peerArchives = await Promise.all(
//     peers.filter(p => p.sessionData).map(p => DatArchive.load(p.sessionData))
//   )
//
//   const states = await Promise.all(
//     peerArchives.concat(selfArchive).map(
//       async archive => {
//         try {
//           const [stateFile, timestamp] = await Promise.all([
//             archive.readFile('/state.json'),
//             archive.readFile('/timestamp')
//           ])
//           // this number is arbitrary
//           if ((Number(timestamp) + 1500) < Date.now()) {
//             return false
//           }
//           const state = JSON.parse(stateFile)
//           // TODO:
//           // 1. make sure state is array of 12 numbers
//           // 2. make sure does not have card more than once
//           // 3. make sure does not have wonder without supporting tech
//           return {
//             state,
//             url: archive.url
//           }
//         } catch (e) {
//           return false
//         }
//       }
//     )
//   )
//   const validSortedStates = states.filter(Boolean).sort((a, b) => {
//     return ('' + a.url).localeCompare(b.url);
//   })
//   const myIndex = validSortedStates.map(p => p.url).indexOf(selfArchive.url)
//   set('myIndex', myIndex)
//   const playerStates = validSortedStates.map(({state, url}, index) => {
//     const adjacentPlayerLeft = index === 0
//       ? validSortedStates[validSortedStates.length - 1].state
//       : validSortedStates[index - 1].state
//     const adjacentPlayerRight = index === (validSortedStates.length - 1)
//       ? validSortedStates[0].state
//       : validSortedStates[index + 1].state
//     return state.map((actionIndex, eraIndex) => {
//       if (
//         flatList[actionIndex].type === 'wonder' &&
//         (
//           flatList[adjacentPlayerRight[eraIndex]].type === 'weapon' ||
//           flatList[adjacentPlayerLeft[eraIndex]].type === 'weapon'
//         )
//       ) {
//         return 0
//       }
//       return actionIndex
//     })
//   })
//   const winners = playerStates.reduce((winners, state, index) => {
//     const wonderCount = state.filter(e => flatList[e].type === 'wonder')
//     if (wonderCount.length === 3) {
//       return winners.concat(index)
//     }
//     return winners
//   }, [])
//   if (winners) {
//     set('winners', winners)
//   } else {
//     set('winners', null)
//   }
//   playerStates.forEach((state, index) => {
//     set(`players.${index}`, state)
//   })
//   if (currentPlayers) {
//     for (let i = validSortedStates.length; i < Object.keys(currentPlayers).length; i++) {
//       set(`players.${i}`, null)
//     }
//   }
//   await selfArchive.writeFile(
//     '/state.json', JSON.stringify(playerStates[myIndex])
//   )
//   setTimeout(() => updateGameState(selfArchive, store, set), 500)
// }
