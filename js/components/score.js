const { el } = require('redom')

const className = '.score'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  display: 'grid',
  gridTemplateRows: 'repeat(2, 45px)',
  gridAutoColumns: '200px',
  gridGap: '3px',
  height: '100px',
  width: '80%',
  marginTop: '10px'
}

const rowStyle = {
  height: '100%',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '100px 100px'
}

const imageStyle = {
  justifySelf: 'end',
  alignSelf: 'center'
}

const scoreStyle = {
  textAlign: 'left',
  padding: '5px',
  color: 'lime',
  fontSize: '42px'
}

module.exports = class Score {
  constructor () {
    this.winIcon = el('img', {style: imageStyle})
    this.winIcon.src = '/images/icon-win.png'
    this.destroyIcon = el('img', {style: imageStyle})
    this.destroyIcon.src = '/images/icon-destroy.png'
    this.winScore = el('div', '0', {style: scoreStyle})
    this.destroyScore = el('div', '0', {style: scoreStyle})
    this.winsEl = el('.wins', this.winIcon, this.winScore, {style: rowStyle})
    this.destructionsEl = el('.destructions', this.destroyIcon, this.destroyScore, {style: rowStyle})
    this.el = el(className,
      {style},
      this.winsEl,
      this.destructionsEl
    )
  }
  update (data) {
    const { winScore, destructionScore } = data
    this.destroyScore.textContent = destructionScore ||
      this.destroyScore.textContent
    this.winScore.textContent = winScore || this.winScore.textContent
  }
}
