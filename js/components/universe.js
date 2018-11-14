const { el, list, setStyle } = require('redom')

const className = '.universe'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  display: 'grid',
  gridGap: '5px',
  alignItems: 'center',
  justifyContent: 'center',
  gridTemplateColumns: '60px 60px 60px 60px 60px',
  gridAutoFlow: 'column'
}

const civilizationStyle = {
  display: 'grid',
  gridTemplateRows: 'repeat(12, 51px)',
  gridTemplateColumns: '60px',
  gridGap: '5px',
  justifyContent: 'space-between',
  alignSelf: 'center',
  justifySelf: 'center'
}

const tileStyle = (isCurrentPlayer, tileIndex) => {
  const playerType = isCurrentPlayer ? 'current-player' : 'opponent'
  return {
    backgroundImage: `url('/images/game-tiles/${playerType}/${tileIndex}.png')`,
    height: '51px',
    width: '60px'
  }
}

const emptyTileStyle = {
  backgroundImage: `url('/images/game-tiles/disabled.png')`,
  height: '51px',
  width: '60px'
}

class Tile {
  constructor () {
    this.el = el('.tile', {
      style: emptyTileStyle
    })
  }
  update ({tileIndex, isCurrentPlayer, isDisabled}) {
    setStyle(this.el,
      isDisabled ? emptyTileStyle : tileStyle(isCurrentPlayer, tileIndex)
    )
  }
}

class Civilization {
  constructor () {
    this.wrapper = el('.civilization', {
      style: civilizationStyle
    })
    this.el = list(this.wrapper, Tile)
    this.el.update([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  }
  update ({tiles, isCurrentPlayer}) {
    this.el.update(tiles.map(t => ({
      tileIndex: t,
      isCurrentPlayer,
      isDisabled: tiles.every(t => t === false)
    })))
  }
}

const emptyPlayer = [
  false, false, false, false, false, false,
  false, false, false, false, false, false
]

module.exports = class Universe {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Civilization)
    this.list.update(
      [emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer]
        .map(p => ({tiles: p}))
    )
  }
  update (data) {
    const { players, currentPlayerIndex } = data
    let playersInUniverse = []
    if (currentPlayerIndex === 2) {
      for (let i = 0; i < 5; i++) {
        playersInUniverse[i] = players[i] || emptyPlayer
      }
    } else if (currentPlayerIndex < 2) {
      const incrementBy = 2 - currentPlayerIndex
      for (let i = 0; i < 5; i++) {
        if (i + incrementBy < 5) {
          playersInUniverse[i + incrementBy] = players[i] || emptyPlayer
        } else {
          playersInUniverse[i + incrementBy - 5] = players[i] || emptyPlayer
        }
      }
    } else if (currentPlayerIndex > 2) {
      const decrementBy = currentPlayerIndex - 2
      for (let i = 0; i < 5; i++) {
        if (i - decrementBy >= 0) {
          playersInUniverse[i - decrementBy] = players[i] || emptyPlayer
        } else {
          playersInUniverse[i - decrementBy + 5] = players[i] || emptyPlayer
        }
      }
    }
    this.list.update(playersInUniverse.map((tiles, i) => ({
      tiles,
      isCurrentPlayer: i === 2
    })))
  }
}
