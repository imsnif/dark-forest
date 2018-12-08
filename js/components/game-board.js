const { el, list } = require('redom')

class Tile {
  constructor (icon, number) {
    this.el = el('.tile', {
      style: {
        backgroundImage: 'url(/images/empty-tile.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center'
      }
    })
  }
  update (data) {

  }
}

class PlayerTiles {
  constructor () {
    const container = el('.playerTiles', { style: {
      display: 'grid',
      gridTemplateRows: '80px 80px 80px 80px 80px',
      justifyContent: 'space-between',
      gridGap: '10px',
      gridAutoColumns: '80px'
    }})
    this.el = list(container, Tile)
    this.el.update(Array(5).fill({}))
  }
  update (playerData) {

  }
}

module.exports = class GameBoard {
  constructor () {
    const container = el('.gameBoard', { style: {
      display: 'grid',
      gridTemplateColumns: '80px 80px 80px 80px 80px',
      justifyContent: 'space-between',
      gridGap: '10px'
    }})
    this.el = list(container, PlayerTiles)
    this.el.update(Array(5).fill({}))
  }
  update (data) {

  }
}
