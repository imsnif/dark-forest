const sinon = require('sinon')
const lolex = require('lolex')
const test = require('tape')

function mockReadFile (now, state) {
  const readFile = sinon.stub()
  readFile.withArgs('/state.json').returns(JSON.stringify(state))
  readFile.withArgs('/timestamp').returns(now)
  return readFile
}

function mockSelfArchive (selfState, now) {
  const writeFile = sinon.spy()
  const url = Object.keys(selfState)[0]
  const readFile = mockReadFile(now, selfState[url])
  return { readFile, writeFile, url }
}

function mockDatApi (peerState, selfState, now) {
  global.experimental = {}
  global.experimental.datPeers = {
    list: () => Object.keys(peerState).map(id => ({sessionData: id}))
  }
  global.DatArchive = {}
  global.DatArchive.load = (id) => ({
    url: id,
    readFile: mockReadFile(now, peerState[id] || selfState[id])
  })
}

function cleanup (clock) {
  clock.uninstall()
  delete global.experimental
  delete global.DatArchive
}

const { updateGameState } = require('../../js/commands/update-game-state')

test(
  'updateGameState() - initial game state with five players', async t => {
    t.plan(5)
    const now = 1000
    const clock = lolex.install({now})
    try {
      const peerState = {
        id1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        id2: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        id4: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        id5: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
      const selfState = { id3: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      const selfArchive = mockSelfArchive(selfState, now)
      const setUiState = sinon.spy()
      mockDatApi(peerState, selfState, now)
      await updateGameState(selfArchive, setUiState)
      t.ok(setUiState.calledWith('players', [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]), 'players scales set properly in ui state')
      t.ok(
        setUiState.calledWith('currentPlayerIndex', 2),
        'currentPlayerIndex set properly in ui state'
      )
      t.ok(
        setUiState.calledWith('winners', []),
        'winners set properly in ui state'
      )
      t.ok(
        selfArchive.writeFile.calledWith(
          '/state.json', JSON.stringify(selfState.id3)
        ),
        'state written to self archive'
      )
      t.ok(
        selfArchive.writeFile.calledWith('/timestamp', JSON.stringify(now)),
        'timestamp written to self archive'
      )
      cleanup(clock)
    } catch (e) {
      t.fail(e.message)
      cleanup(clock)
      t.end()
    }
  }
)
