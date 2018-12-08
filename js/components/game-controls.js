const { el, list } = require('redom')

class ControlPane {
  constructor () {
    this.el = el('div')
  }
  update (actionName) {
    this.el = el('img', {
      src: `/images/${actionName}-button.png`,
      style: {
        alignSelf: 'center',
        justifySelf: 'center'
      }
    })
  }
}

module.exports = class GameControls {
  constructor () {
    const container = el('.gameControls', { style: {
      display: 'grid',
      gridTemplateColumns: '120px 120px 120px 120px',
      justifyContent: 'space-between',
      alignContent: 'end'
    }})
    this.el = list(container, ControlPane)
    this.el.update([
      'build-fusion',
      'build-antimatter',
      'build-gw',
      'build-wormhole'
    ])
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
