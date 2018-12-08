const { el } = require('redom')
const colors = require('./colors')

const fusionIcon = '/images/top-bar-fusion-icon.png'
const antimatterIcon = '/images/top-bar-antimatter-icon.png'
const gwIcon = '/images/top-bar-gw-icon.png'

class EnergyIcons {
  constructor () {
    this.fusionIcon = el('img', {
      src: fusionIcon
    })
    this.antimatterIcon = el('img', {
      src: antimatterIcon
    })
    this.gwIcon = el('img', {
      src: gwIcon
    })
    this.el = el(
      '.energyIcons',
      this.fusionIcon,
      this.antimatterIcon,
      this.gwIcon,
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '25px 25px 25px',
          gridGap: '25px',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }
    )
  }
}

class Control {
  constructor () {
    this.upArrow = el('img', {
      src: '/images/up-arrow-button.png'
    })
    this.number = el('.controlText', {
      textContent: '0',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: colors.positive,
        alignSelf: 'center'
      }
    })
    this.downArrow = el('img', {
      src: '/images/down-arrow-button.png'
    })
    this.el = el(
      '.control',
      this.upArrow,
      this.number,
      this.downArrow,
      {
        style: {
          display: 'grid',
          gridTemplateRows: '10px 20px 10px',
          gridGap: '5px'
        }
      }
    )
  }
  update () {

  }
}

class ControlStrip {
  constructor () {
    this.fusionControl = new Control()
    this.antimatterControl = new Control()
    this.gwControl = new Control()
    this.el = el(
      '.controlStrip',
      this.fusionControl,
      this.antimatterControl,
      this.gwControl,
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '25px 25px 25px',
          gridGap: '25px',
          justifyContent: 'center',
          justifyItems: 'center',
          alignItems: 'center'
        }
      }
    )
  }
  update () {

  }
}

class ConverterControls {
  constructor () {
    this.name = el('.name', {
      textContent: '????',
      style: {
        textTransform: 'uppercase',
        fontSize: '30px',
        color: colors.information,
        textAlign: 'center',
        fontWeight: 'bold'
      }
    })
    this.energyIcons = new EnergyIcons()
    this.controlStrip = new ControlStrip()
    this.el = el(
      '.controls',
      this.name,
      this.energyIcons,
      this.controlStrip,
      {
        style: {
          backgroundImage: 'url(/images/converter-current-player-background.png)',
          backgroundSize: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          alignContent: 'space-between',
          display: 'grid',
          gridTemplateRows: '35px 25px 75px'
        }
      }
    )
  }
  update (data) {

  }
}

class OpponentPlayerControls {
  constructor () {
    this.name = el('.name', {
      textContent: '????',
      style: {
        textTransform: 'uppercase',
        fontSize: '30px',
        color: colors.information,
        textAlign: 'center',
        fontWeight: 'bold'
      }
    })
    this.energyIcons = new EnergyIcons()
    this.el = el(
      '.controls',
      this.name,
      this.energyIcons,
      {
        style: {
          backgroundImage: 'url(/images/converter-opponent-player-background.png)',
          backgroundSize: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          alignContent: 'space-between',
          display: 'grid',
          gridTemplateRows: '35px 25px 75px'
        }
      }
    )
  }
  update (data) {

  }
}

module.exports = class ConverterControlsStrip {
  constructor () {
    this.opponentPlayerLeft = new OpponentPlayerControls()
    this.currentPlayerControls = new ConverterControls()
    this.opponentPlayerRight = new OpponentPlayerControls()
    this.el = el(
      '.converterControlsStrip',
      this.opponentPlayerLeft,
      this.currentPlayerControls,
      this.opponentPlayerRight,
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridAutoRows: '145px',
          justifyContent: 'space-evenly',
          alignContent: 'center'
        }
      }
    )
  }
  update (data) {

  }
}
