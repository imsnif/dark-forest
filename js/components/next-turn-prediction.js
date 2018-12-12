const { el, list } = require('redom')
const colors = require('./colors')

const pointsIcon = '/images/top-bar-point-icon.png'
const fusionIcon = '/images/top-bar-fusion-icon.png'
const antimatterIcon = '/images/top-bar-antimatter-icon.png'
const gwIcon = '/images/top-bar-gw-icon.png'

// TODO: consider merging this with the top bar scores
class ResourceScore {
  constructor (icon, number) {
    this.icon = el('img', {
      src: icon,
      style: {
        alignSelf: 'center',
        justifySelf: 'start'
      }
    })
    this.count = el('.score', {
      textContent: number,
      style: {
        color: colors.positive,
        justifySelf: 'center',
        alignSelf: 'center',
        fontSize: '19px',
        fontWeight: 'bold'
      }
    })
    this.el = el('.pointscore', this.icon, this.count, {
      style: {
        display: 'grid',
        gridTemplateColumns: '25px 40px',
        gridGap: '5px',
        marginLeft: '10px'
      }
    })
  }
  update (data) {
    this.count.textContent = data
  }
}

class Prediction {
  constructor () {
    this.el = el('div')
  }
  update ({icon, gain, loss}) {
    this.icon = el('img', {
      src: icon,
      style: {
        alignSelf: 'center',
        justifySelf: 'start'
      }
    })
    this.gain = el('.gain', {
      textContent: `+${gain}`,
      style: {
        color: colors.positive,
        fontSize: '25px',
        fontWeight: 'bold',
        justifySelf: 'end'
      }
    })
    this.slash = el('.slash', {
      textContent: '/',
      style: {
        color: 'white',
        fontSize: '25px',
        fontWeight: 'bold'
      }
    })
    this.loss = el('.loss', {
      textContent: `-${loss}`,
      style: {
        color: colors.negative,
        fontSize: '25px',
        fontWeight: 'bold',
        justifySelf: 'start'
      }
    })
    this.el = el(
      '.prediction',
      this.icon,
      this.gain,
      this.slash,
      this.loss,
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '25px 30px 10px 30px',
          gridAutoRows: '100%',
          gridGap: '10px',
          justifyContent: 'space-around'
        }
      }
    )
  }
}

module.exports = class NextTurnPrediction {
  constructor () {
    const container = el('.nextTurnPrediction', { style: {
      display: 'grid',
      gridTemplateRows: '25px 25px 25px 25px',
      gridAutoColumns: '100%',
      justifyContent: 'space-between',
      alignContent: 'center',
      gridGap: '10px'
    }})
    this.el = list(container, Prediction)
    this.el.update([
      {
        icon: pointsIcon,
        gain: '10',
        loss: '5'
      },
      {
        icon: fusionIcon,
        gain: '10',
        loss: '5'
      },
      {
        icon: antimatterIcon,
        gain: '10',
        loss: '5'
      },
      {
        icon: gwIcon,
        gain: '10',
        loss: '5'
      }
    ])
  }
  update ({nextTurnPredictionInfo}) {
    this.el.update([
      {
        icon: pointsIcon,
        gain: nextTurnPredictionInfo.points.gain,
        loss: nextTurnPredictionInfo.points.loss
      },
      {
        icon: fusionIcon,
        gain: nextTurnPredictionInfo.fusion.gain,
        loss: nextTurnPredictionInfo.fusion.loss
      },
      {
        icon: antimatterIcon,
        gain: nextTurnPredictionInfo.antimatter.gain,
        loss: nextTurnPredictionInfo.antimatter.loss
      },
      {
        icon: gwIcon,
        gain: nextTurnPredictionInfo.gw.gain,
        loss: nextTurnPredictionInfo.gw.loss
      }
    ])
  }
}
