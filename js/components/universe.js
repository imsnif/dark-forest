const { el, list } = require('redom')

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

const tileStyle = {
  backgroundImage: 'url("/images/game-tiles/opponent/0.png")',
  height: '51px',
  width: '60px'
}

class Tile {
  constructor () {
    this.el = el('.tile', {
      style: tileStyle
    })
  }
  update () {

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
  update () {

  }
}

module.exports = class Universe {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Civilization)
    this.list.update([0, 0, 1, 2, 3])
  }
  update (data) {
    const { players } = data
//    this.list.update(players.map((playerState, playerIndex) => {
//      const currentPlayer = Number(data.currentPlayerIndex) === Number(playerIndex)
//      return {
//        eras: playerState.map(actionIndex => ({
//          actionIndex,
//          playerIndex,
//          currentPlayer
//        })),
//        currentPlayer,
//        isWinner: data.winners.includes(Number(playerIndex))
//      }
//    }))
  }
}
