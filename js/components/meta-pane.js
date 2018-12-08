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
    this.el = el(className,
      new ClockCount(),
      new MetaDownArrow(),
      new NextTurnPrediction(),
      new MetaControls(),
      {style}
    )
  }
  update (data) {

  }
}
