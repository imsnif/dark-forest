const { el, list } = require('redom')

const Scale = require('./scale')

const className = '.universe'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  display: 'grid',
  gridGap: '100px',
  alignItems: 'center',
  justifyContent: 'center',
  gridAutoFlow: 'column',
  height: '100%',
  width: '100%'
}

module.exports = class Universe {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Scale)
  }
  update (data) {
    const { players } = data
    this.list.update(players.map((playerState, playerIndex) => {
      const currentPlayer = Number(data.currentPlayerIndex) === Number(playerIndex)
      return {
        eras: playerState.map(actionIndex => ({
          actionIndex,
          playerIndex,
          currentPlayer
        })),
        currentPlayer,
        isWinner: data.winners.includes(Number(playerIndex))
      }
    }))
  }
}
