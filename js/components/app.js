'use strict'

const { el } = require('redom')
const Universe = require('./universe')
const Inventory = require('./inventory')

const className = '.game'
const style = {
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  position: 'absolute',
  display: 'grid'
}

module.exports = class App {
  constructor () {
    this.universe = new Universe()
    this.inventory = new Inventory()
    this.el = el(className,
      this.inventory,
      this.universe,
      {style}
    )
  }
  update (data) {
    this.universe.update(data)
    this.inventory.update(data.players[data.myIndex])
  }
}
