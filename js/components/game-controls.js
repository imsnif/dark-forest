const { el, list } = require('redom')
const { dispatch } = require('../util/dispatch')
const { buildingData } = require('./statics')

class ControlPane {
  constructor () {
    this.el = el('div')
  }
  update ({building, currentPlayer}) {
    const isDisabled =
      building.actions > currentPlayer.actionsLeft ||
      building.points > currentPlayer.points
    this.el = el('img', {
      onclick: () => {
        if (isDisabled) return
        dispatch(this, 'selectBuilding', building)
      },
      src: isDisabled
        ? `/images/build-${building.name}-button-disabled.png`
        : `/images/build-${building.name}-button.png`,
      style: {
        alignSelf: 'center',
        justifySelf: 'center',
        userSelect: 'none',
        '-webkit-user-drag': 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer'
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
  }
  update (currentPlayer) {
    const buildableBuildings = Object.keys(buildingData)
      .filter(name => name !== 'empty')
      .map(name => ({
        building: Object.assign({}, buildingData[name], {name}),
        currentPlayer
      }))
    this.el.update(buildableBuildings)
  }
}
