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

class Score {
  constructor () {
    this.name = el('.name', {
      textContent: '????',
      style: {
        textTransform: 'uppercase',
        fontSize: '20px',
        color: colors.information,
        textAlign: 'center',
        fontWeight: 'bold',
        alignSelf: 'end'
      }
    })
    this.pointScore = new ResourceScore(pointsIcon, '???')
    this.fusionScore = new ResourceScore(fusionIcon, '???')
    this.antimatterScore = new ResourceScore(antimatterIcon, '???')
    this.gwScore = new ResourceScore(gwIcon, '???')
    this.el = el(
      '.score',
      this.name,
      this.pointScore,
      this.fusionScore,
      this.antimatterScore,
      this.gwScore,
      {
        style: {
          display: 'grid',
          gridTemplateRows: '26px 20px 20px 20px 20px',
          gridGap: '5px'
        }
      }
    )
  }
  update (playerData) {
    const { points, fusion, antimatter, gw, name } = playerData
    this.name.textContent = name
    this.pointScore.update(points)
    this.fusionScore.update(fusion)
    this.antimatterScore.update(antimatter)
    this.gwScore.update(gw)
  }
}

const playerDataPlaceholder = {
  name: 'foo',
  points: 133,
  fusion: 666,
  antimatter: 666,
  gw: 0
}

module.exports = class PlayerScores {
  constructor () {
    const container = el('.playerScores', { style: {
      display: 'grid',
      gridTemplateColumns: '80px 80px 80px 80px 80px',
      justifyContent: 'space-between',
      alignContent: 'end',
      gridGap: '10px'
    }})
    this.el = list(container, Score)
    this.el.update(Array(5).fill(playerDataPlaceholder))
  }
  update (data) {
    const { actionsLeft, points, fusion, antimatter, gw } = data
    this.actionsLeft.textContent = actionsLeft
    this.points.textContent = points
    this.fusion.textContent = fusion
    this.antimatter.textContent = antimatter
    this.gw.textContent = gw
  }
}
