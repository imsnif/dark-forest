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
    this.energyConverterStrip = new EnergyConverterStrip()
    this.el = el(
      className,
      this.playerScores,
      this.energyConverterStrip,
      this.gameBoard,
      this.gameControls,
      {style}
    )
  }
  update (data) {
    const {
      currentPlayer,
      leftOpponents,
      rightOpponents,
      selectedBuilding
    } = data
    const allPlayers = [
      leftOpponents[1] || {},
      leftOpponents[0] || {},
      currentPlayer || {},
      rightOpponents[0] || {},
      rightOpponents[1] || {}
    ]
    this.playerScores.update(allPlayers)
    this.gameControls.update(currentPlayer)
    this.gameBoard.update({allPlayers, selectedBuilding})
  }
}
