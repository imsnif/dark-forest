const { el, list, setStyle } = require('redom')
const { dispatch } = require('../util/dispatch')

class Tile {
  constructor () {
    this.el = el(
      '.tile',
      {
        onclick: () => {
          dispatch(this, 'placeSelectedBuilding', this.index)
        },
        style: {
          backgroundImage: 'url(/images/empty-tile.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center'
        }
      }
    )
  }
  update ({index, tile, isCurrentPlayer, hasSelectedBuilding}) {
    const name = tile.name || 'empty'
    const prefix = isCurrentPlayer ? 'current-player' : 'opponent'
    this.index = index
    this.isBuildTarget =
      hasSelectedBuilding && isCurrentPlayer
    setStyle(this.el, {
      backgroundImage: this.isBuildTarget
        ? `url(/images/${prefix}-${name}-tile-select.png)`
        : `url(/images/${prefix}-${name}-tile.png)`,
      cursor: this.isBuildTarget
        ? 'pointer'
        : 'initial'
    })
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
  }
  update ({tiles, isCurrentPlayer, hasSelectedBuilding}) {
    this.el.update(tiles.map((tile, index) => ({
      index,
      tile,
      isCurrentPlayer,
      hasSelectedBuilding
    })))
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
  }
  update ({allPlayers, selectedBuilding}) {
    this.el.update(allPlayers.map((player, index) => ({
      tiles: player.tiles || [],
      isCurrentPlayer: index === 2,
      hasSelectedBuilding: !!selectedBuilding
    })))
  }
}
