const { el } = require('redom')
const { dispatch } = require('../util/dispatch')
const { flatList } = require('./statics')

const className = '.era'
const style = {
  backgroundColor: 'red',
  height: '30px',
  width: '80px',
  borderStyle: 'solid',
  borderWidth: '5px',
  textAlign: 'center',
  cursor: 'pointer',
  userSelect: 'none'
}

const colors = {
  black: '#212121',
  red: '#c30771',
  green: '#10a778',
  yellow: '#a89c14',
  blue: '#008ec4',
  magenta: '#523c79',
  cyan: '#20a5ba',
  white: '#e0e0e0'
}

const typeColors = {
  none: colors.white,
  tech: colors.yellow,
  weapon: colors.red,
  wonder: colors.cyan
}

const eraColors = {
  none: colors.white,
  zero: colors.green,
  one: colors.magenta,
  two: colors.blue
}

module.exports = class Era {
  constructor () {
    this.el = el(className, {
      style,
      ondrop: (ev) => {
        const source = ev.dataTransfer.getData('source')
        const destination = this.eraLocation
        ev.preventDefault()
        if (
          source !== undefined &&
          destination !== undefined &&
          this.currentPlayer
        ) {
          dispatch(this, 'switch', {
            source, destination
          })
        }
      },
      ondragover: (ev) => {
        ev.preventDefault()
      },
      ondragstart: (ev) => {
        ev.dataTransfer.setData('source', this.eraLocation)
      },
      draggable: true
    })
  }
  update (data, index, items, context) {
    const eraData = flatList[data.eraIndex]
    const { playerId } = data
    this.scaleId = playerId
    this.eraLocation = index
    this.currentPlayer = data.currentPlayer
    const {type, era, text} = eraData
    this.el.style.backgroundColor = typeColors[type]
    this.el.style.borderColor = eraColors[era]
    this.el.textContent = text // TODO: color
  }
}
