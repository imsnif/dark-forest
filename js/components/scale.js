const { el, list } = require('redom')

const baseNebulaUrl = '/images/civ-background.png'

const Era = require('./era')

const className = '.scale'
const style = {
  height: '700px',
  width: '150px',
  display: 'grid',
  gridGap: '10px',
  gridAutoFlow: 'row',
  justifyItems: 'center',
  alignContent: 'center',
  backgroundImage: `url(${baseNebulaUrl})`
}

const imgStyle = {
  height: '700px'
}

module.exports = class Scale {
  constructor () {
//    this.img = el('img', {style: imgStyle})
//    this.img.src = baseNebulaUrl
    this.el = el(className,
      // this.img,
      {style}
    )
    this.list = list(this.el, Era)
  }
  update (data) {
    if (data.isWinner) {
      // TODO: winner and current player
//      this.el.style.backgroundColor = 'green'
//      this.el.style.border = '5px solid green'
    } else if (data.currentPlayer) {
//      this.el.style.backgroundColor = 'red'
//      this.el.style.border = '5px solid red'
    } else {
//      this.el.style.backgroundColor = 'gray'
//      this.el.style.border = '5px solid gray'
    }
    this.list.update(data.eras)
  }
}
