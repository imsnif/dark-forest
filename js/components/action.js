const { el } = require('redom')
const { flatList } = require('./statics')
const { dispatch } = require('../util/dispatch')
// const { dispatch } = require('../util/dispatch')
// const { flatList } = require('./statics')
// dispatch(app, key, val)

const className = '.action'
const style = {
  backgroundColor: 'pink',
  borderColor: 'gray',
  height: '30px',
  width: '80px',
  borderStyle: 'solid',
  borderWidth: '5px',
  textAlign: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  alignSelf: 'center',
  justifySelf: 'center'
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

module.exports = class Action {
  constructor () {
    this.el = el(className, {
      onclick: () => {
        if (!this.disabled) {
          dispatch(this, 'action', {
            actionIndex: this.actionIndex
          })
        }
      },
      style
    })
  }
  update (data, index, items, context) {
    const { actionIndex, disabled } = data
    const eraData = flatList[actionIndex]
    const { type, era, text } = eraData
    this.actionIndex = actionIndex
    this.disabled = disabled
    this.el.style.backgroundColor = typeColors[type]
    this.el.style.borderColor = eraColors[era]
    this.el.textContent = text // TODO: color
    if (disabled) {
      this.el.style.opacity = '0.3'
      this.el.style.cursor = 'not-allowed'
    } else {
      this.el.style.opacity = '1'
      this.el.style.cursor = 'pointer'
    }
  }
}
