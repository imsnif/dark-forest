const { el } = require('redom')

const ClockCount = require('./clock-count')
const MetaDownArrow = require('./meta-down-arrow')
const NextTurnPrediction = require('./next-turn-prediction')
const MetaControls = require('./meta-controls')

const className = '.meta-pane'

const style = {
  height: '491px',
  alignSelf: 'end',
  display: 'grid',
  gridTemplateRows: '43px 55px 121px 1fr',
  gridGap: '10px'
}

module.exports = class MetaPane {
  constructor () {
    this.clockCount = new ClockCount()
    this.nextTurnPrediction = new NextTurnPrediction()
    this.el = el(
      className,
      this.clockCount,
      new MetaDownArrow(),
      this.nextTurnPrediction,
      new MetaControls(),
      {style}
    )
  }
  update ({ time, nextTurnPredictionInfo }) {
    this.clockCount.update(time)
    this.nextTurnPrediction.update({nextTurnPredictionInfo})
  }
}
