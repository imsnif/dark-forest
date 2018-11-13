'use strict'

const { el } = require('redom')
const Universe = require('./universe')
const Inventory = require('./inventory')
const Score = require('./score')

const backgroundUrl = '/images/background.png'

const className = '.game'
const style = {
  width: '1024px',
  height: '768px',
  display: 'grid',
  gridTemplateColumns: '500px 500px',
  gridTemplateRows: '100%',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  justifyContent: 'space-between'
}

const backgroundImageStyle = {
  width: '100%',
  height: '100%',
  position: 'fixed',
  backgroundImage: `url(${backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center'
}

const wrapperStyle = {
  margin: '10px',
  display: 'grid'
}

module.exports = class App {
  constructor () {
    this.universe = new Universe()
    this.inventory = new Inventory()
    this.score = new Score()
    this.leftWrapper = el('.wrapper', this.universe, {
      style: wrapperStyle
    })
    this.rightWrapper = el('.wrapper', this.score, this.inventory, {
      style: Object.assign({}, wrapperStyle, {
        display: 'grid',
        gridTemplateRows: '380px 380px',
        gridTemplateColumns: '460px',
        alignContent: 'space-between'
      })
    })
    this.game = el(className,
      this.leftWrapper,
      this.rightWrapper,
      {style}
    )
    this.el = el('.background-image', this.game, {
      style: backgroundImageStyle
    })
  }
  update (data) {
    this.universe.update(data)
    this.inventory.update(data.players[data.currentPlayerIndex])
    this.score.update({
      destructionScore: data.destructionScore,
      winScore: data.winScore
    })
  }
}
