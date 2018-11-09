const { el } = require('redom')
const { flatList } = require('./statics')
const { dispatch } = require('../util/dispatch')

const className = '.action'
const style = {
  height: '175px',
  width: '179px',
  cursor: 'pointer',
  userSelect: 'none',
  alignSelf: 'center',
  justifySelf: 'center'
}

const toCssUrl = file => `url('/images/${file}')`

const getImageFilename = (era, index) => {
  return index === 1 || index === 2
    ? toCssUrl(`tile-discovery-${era}-${index}.png`)
    : toCssUrl(`tile-wonder-${era}.png`)
}

const getWeaponFilename = () => {
  return toCssUrl(`tile-weapon.png`)
}

module.exports = class Action {
  constructor () {
    this.el = el(className, {
      onclick: () => {
        const { type, era, nextIndex } = this.data
        if (nextIndex < 4) {
          const nextTileIndex = flatList.findIndex(item => {
            if (type === 'build') {
              if (nextIndex === 1 || nextIndex === 2) {
                return item.era === era &&
                  item.type === 'tech' &&
                  item.index === nextIndex
              } else {
                return item.era === era && item.type === 'wonder'
              }
            } else {
              if (item.type === 'weapon') return true
              // TODO: change weapon type in list so that there aren't 3
              // different ones
            }
          })
          dispatch(this, 'build', nextTileIndex)
        }
      },
      style
    })
  }
  update (data) {
    const { type, era, nextIndex } = this.data = data
    const image = type === 'build'
      ? getImageFilename(era, nextIndex)
      : getWeaponFilename()
    this.el.style.backgroundImage = image
  }
}
