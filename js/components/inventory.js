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
  gridTemplateRows: '180px 120px',
  gridTemplateColumns: '500px',
  gridGap: '10px'
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

const buttonStyle = {
  backgroundImage: 'url("/images/game-tiles/buttons/age1-0.png")',
  justifySelf: 'center',
  width: '112px',
  height: '108px'
}

const pirateButtonStyle = {
  backgroundImage: 'url("/images/game-tiles/buttons/pirate.png")',
  justifySelf: 'center',
  width: '174px',
  height: '169px'
}

const listWrapperStyle = {
  width: '356px',
  height: '111px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 110px)',
  gridTemplateRows: '111px',
  gridGap: '10px',
  justifyContent: 'space-between',
  justifySelf: 'center'
}

class Button {
  constructor () {
    this.el = el('.button', {
      style: buttonStyle
    })
  }
  update (data) {

  }
}

class PirateButton {
  constructor () {
    this.el = el('.pirate-button', {
      style: pirateButtonStyle
    })
  }
}

class ListWrapper {
  constructor () {
    this.el = el('.listWrapper', {
      style: listWrapperStyle
    })
  }
  update () {

  }
}

module.exports = class Inventory {
  constructor () {
    this.pirateButton = new PirateButton()
    this.buttonList = list(new ListWrapper(), Button)
    this.el = el(className,
      this.pirateButton,
      this.buttonList,
      {style}
    )
    this.buttonList.update([1, 2, 3])
  }
  update (data) {
    const currentPlayerUsedItems = data.map(i => flatList[i])
    const nextFirstEraIndex = getNextItem('one', currentPlayerUsedItems)
    const nextSecondEraIndex = getNextItem('two', currentPlayerUsedItems)
    const nextThirdEraIndex = getNextItem('three', currentPlayerUsedItems)
    const nextWeaponIndex = currentPlayerUsedItems
      .filter(i => i.type === 'weapon')
      .length + 1
//    this.list.update([
//      {type: 'build', era: 'one', nextIndex: nextFirstEraIndex},
//      {type: 'build', era: 'two', nextIndex: nextSecondEraIndex},
//      {type: 'build', era: 'three', nextIndex: nextThirdEraIndex},
//      {type: 'weapon', nextIndex: nextWeaponIndex}
//    ])
  }
}
