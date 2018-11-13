const { el } = require('redom')

const className = '.score'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  display: 'grid',
  gridTemplateRows: 'repeat(2, 164px)',
  gridTemplateColumns: '460px',
  gridGap: '10px',
}

const scoreStyle = {
  backgroundImage: `url(/images/scoreboard.png)`,
  width: '375px',
  justifySelf: 'center'
}

const tbdStyle = {
  backgroundImage: `url(/images/tbd.png)`,
  width: '375px',
  justifySelf: 'center'
}

module.exports = class Score {
  constructor () {
    this.scoreEl = el('.score', {
      style: scoreStyle
    })
    this.tbdEl = el('.tbd', {
      style: tbdStyle
    })
    this.el = el(className,
      this.scoreEl,
      this.tbdEl,
      {style}
    )
  }
  update (data) {
    const { winScore, destructionScore } = data
//    this.destroyScore.textContent = destructionScore ||
//      this.destroyScore.textContent
//    this.winScore.textContent = winScore || this.winScore.textContent
  }
}
