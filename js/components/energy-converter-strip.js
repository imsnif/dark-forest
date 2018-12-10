const { el } = require('redom')
const { dispatch } = require('../util/dispatch')

class Converter {
  constructor () {
    this.el = el('img', {
      src: '/images/energy-converter.png'
    })
  }
  update () {

  }
}

class ClickableConverter {
  constructor (indexOnBoard) {
    this.el = el(
      'img',
      {
        src: '/images/energy-converter.png',
        onclick: e => {
          e.stopPropagation() // TODO: prevent modal hiding better
          dispatch(this, 'openConverterModal', indexOnBoard)
        }
      }
    )
  }
  update () {

  }
}

class CenterFrame {
  constructor () {
    this.rightConverter = new ClickableConverter(1)
    this.centerConverter = new ClickableConverter(2)
    this.leftConverter = new ClickableConverter(3)
    this.el = el(
      '.center-frame',
      this.rightConverter,
      this.centerConverter,
      this.leftConverter,
      {
        style: {
          display: 'grid',
          backgroundImage: 'url(/images/converter-frame.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          gridTemplateColumns: '80px 80px 80px',
          alignItems: 'center',
          justifyContent: 'space-between',
          gridGap: '23px',
          paddingLeft: '20px',
          paddingRight: '20px',
          height: '100%'
        }
      }
    )
  }
  update () {

  }
}

module.exports = class EnergyConverterStrip {
  constructor () {
    this.leftConverter = new Converter()
    this.rightConverter = new Converter()
    this.centerConverters = new CenterFrame()
    this.el = el(
      '.energyConverterStrip',
      this.leftConverter,
      this.centerConverters,
      this.rightConverter,
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '80px 312px 80px',
          justifyContent: 'space-between',
          alignItems: 'center',
          gridGap: '10px',
          height: '100%',
          paddingLeft: '5px'
        }
      }
    )
  }
  update (data) {
  }
}
