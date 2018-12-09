const { el, list } = require('redom')
const { dispatch } = require('../util/dispatch')

const buildings = [
  {
    name: 'fusion',
    actions: 1,
    points: 0
  },
  {
    name: 'antimatter',
    actions: 1,
    points: 20
  },
  {
    name: 'gw',
    actions: 1,
    points: 400
  },
  {
    name: 'wormhole',
    actions: 1,
    points: 10
  }
]

class ControlPane {
  constructor () {
    this.el = el('div')
  }
  update ({building, currentPlayer}) {
    const isDisabled =
      building.actions > currentPlayer.actions ||
      building.points > currentPlayer.points
    this.el = el('img', {
      onclick: () => {
        if (isDisabled) return
        dispatch(this, 'selectBuilding', building.name)
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
    this.el.update(buildings.map(building => ({building, currentPlayer})))
  }
}
