'use strict'

const { el } = require('redom')
const Universe = require('./universe')
const Inventory = require('./inventory')
const Score = require('./score')

const backgroundUrl = '/images/background.png'

const className = '.game'
const style = {
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  position: 'absolute',
  display: 'grid',
  backgroundImage: `url(${backgroundUrl})`
}

module.exports = class App {
  constructor () {
    this.universe = new Universe()
    this.inventory = new Inventory()
    this.score = new Score()
    this.el = el(className,
      this.score,
      this.inventory,
      this.universe,
      {style}
    )
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
