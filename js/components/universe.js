const { el, list } = require('redom')

const Scale = require('./scale')

const className = '.universe'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  backgroundColor: '#212121',
  display: 'grid',
  gridGap: '100px',
  alignItems: 'center',
  justifyContent: 'center',
  gridAutoFlow: 'column',
  height: '80%',
  width: '80%'
}

module.exports = class Universe {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Scale)
  }
  update (data) {
    const players = data.players || this.players
    if (!players) return
    this.list.update(Object.keys(data.players).filter(p => p && data.players[p]).sort().map(playerId => {
      const currentPlayer = Number(data.myIndex) === Number(playerId)
      return {
        eras: Object.keys(data.players[playerId]).map(eraIndex => ({
          eraIndex: data.players[playerId][eraIndex],
          playerId,
          currentPlayer
        })),
        currentPlayer,
        isWinner: data.winners
          ? data.winners.includes(Number(playerId))
          : false
      }
    }))
    this.players = players
  }
}
