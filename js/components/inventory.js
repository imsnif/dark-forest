const { el, list, setStyle } = require('redom')
const { dispatch } = require('../util/dispatch')

const { eraItems, weaponIndex } = require('./statics')

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

const buttonStyle = (age, index) => ({
  backgroundImage: `url('/images/game-tiles/buttons/age${age}-${index}.png')`,
  justifySelf: 'center',
  width: '112px',
  height: '108px'
})

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

const eraWords = [
  'none',
  'one',
  'two',
  'three'
]

class Button {
  constructor () {
    this.el = el('.button', {
      onclick: () => {
        const { type, era, nextIndex } = this.data
        if (nextIndex < 4) {
          dispatch(this, 'build', {era, nextIndex})
        }
      },
      style: buttonStyle(1, 0)
    })
  }
  update ({type, era, nextIndex}) {
    this.data = {type, era, nextIndex}
    setStyle(this.el, buttonStyle(era, nextIndex - 1))
  }
}

class PirateButton {
  constructor () {
    this.el = el('.pirate-button', {
      onclick: () => {
        const { nextIndex } = this.data
        if (nextIndex < 4) {
          dispatch(this, 'build', {era: 'n/a', nextIndex: 1})
        }
      },
      style: pirateButtonStyle
    })
  }
  update (data) {
    this.data = data
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
    const currentPlayerUsedItems = data
    const nextFirstEraIndex = 1 + currentPlayerUsedItems
      .filter(i => eraItems('one').includes(i)).length
    const nextSecondEraIndex = 1 + currentPlayerUsedItems
      .filter(i => eraItems('two').includes(i)).length
    const nextThirdEraIndex = 1 + currentPlayerUsedItems
      .filter(i => eraItems('three').includes(i)).length
//    const nextSecondEraIndex = getNextItem('two', currentPlayerUsedItems)
//    const nextThirdEraIndex = getNextItem('three', currentPlayerUsedItems)
    const nextWeaponIndex = currentPlayerUsedItems
      .filter(i => i === weaponIndex)
      .length + 1
    this.buttonList.update([
      {type: 'build', era: '1', nextIndex: nextFirstEraIndex},
      {type: 'build', era: '2', nextIndex: nextSecondEraIndex},
      {type: 'build', era: '3', nextIndex: nextThirdEraIndex}
    ])
    this.pirateButton.update(
      {type: 'weapon', nextIndex: nextWeaponIndex}
    )
  }
}
