const { el } = require('redom')

module.exports = class MetaDownArrow {
  constructor () {
    this.el = el('img', {
      src: '/images/meta-down-arrow.png',
      style: {
        alignSelf: 'center',
        justifySelf: 'center'
      }
    })
  }
  update (data) {

  }
}
