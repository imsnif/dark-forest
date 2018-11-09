const { el, list } = require('redom')

const { flatList } = require('./statics')
const Action = require('./action')

const className = '.inventory'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 180px)',
  gridGap: '20px',
  gridAutoRows: '80px',
  height: '200px',
  width: '80%'
}

const getNextItem = (era, currentPlayerUsedItems) => {
  return currentPlayerUsedItems.reduce((nextItemIndex, usedItem) => {
    if (usedItem.era === era && usedItem.type !== 'weapon') {
      return nextItemIndex + 1
    } else {
      return nextItemIndex
    }
  }, 1)
}

module.exports = class Inventory {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Action)
    this.list.update([])
  }
  update (data) {
    const currentPlayerUsedItems = data.map(i => flatList[i])
    const nextFirstEraIndex = getNextItem('one', currentPlayerUsedItems)
    const nextSecondEraIndex = getNextItem('two', currentPlayerUsedItems)
    const nextThirdEraIndex = getNextItem('three', currentPlayerUsedItems)
    const nextWeaponIndex = currentPlayerUsedItems
      .filter(i => i.type === 'weapon')
      .length + 1
    this.list.update([
      {type: 'build', era: 'one', nextIndex: nextFirstEraIndex},
      {type: 'build', era: 'two', nextIndex: nextSecondEraIndex},
      {type: 'build', era: 'three', nextIndex: nextThirdEraIndex},
      {type: 'weapon', nextIndex: nextWeaponIndex}
    ])
  }
}
