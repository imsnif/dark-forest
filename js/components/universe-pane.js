const { el } = require('redom')

const className = '.universe'

const PlayerScores = require('./player-scores')
const EnergyConverterStrip = require('./energy-converter-strip')
const GameBoard = require('./game-board')
const GameControls = require('./game-controls')

const style = {
  display: 'grid',
  gridTemplateRows: '120px 40px 450px 120px',
  gridGap: '10px',
  alignContent: 'end'
}

module.exports = class UniversePane {
  constructor () {
    this.playerScores = new PlayerScores()
    this.gameControls = new GameControls()
    this.gameBoard = new GameBoard()
    this.el = el(
      className,
      this.playerScores,
      new EnergyConverterStrip(),
      this.gameBoard,
      this.gameControls,
      {style}
    )
  }
  update (data) {
    const { currentPlayer, opponents, selectedBuilding } = data
    const allPlayers = opponents // TODO: pad for less than 5 players
      .slice(0, 2)
      .concat([currentPlayer])
      .concat(opponents.slice(2, 4))
    this.playerScores.update(allPlayers)
    this.gameControls.update(currentPlayer)
    this.gameBoard.update({allPlayers, selectedBuilding})
  }
}
