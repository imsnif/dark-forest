const { el, list, place } = require('redom')
const colors = require('./colors')

const fusionIcon = '/images/top-bar-fusion-icon.png'
const antimatterIcon = '/images/top-bar-antimatter-icon.png'
const gwIcon = '/images/top-bar-gw-icon.png'

const { dispatch } = require('../util/dispatch')

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
  constructor (energyType) {
    this.energyType = energyType
    this.upArrow = el('img', {
      src: '/images/up-arrow-button.png',
      onclick: () => {
        dispatch(this, 'sellEnergy', {
          energyType,
          converterIndex: this.converterIndex,
          amount: 1
        })
      }
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
      src: '/images/down-arrow-button.png',
      onclick: () => {
        dispatch(this, 'sellEnergy', {
          energyType,
          converterIndex: this.converterIndex,
          amount: -1
        })
      }
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
  update ({converterIndex, converter}) {
    this.converterIndex = converterIndex
    this.number.textContent = converter[this.energyType]
  }
}

class ControlStrip {
  constructor () {
    this.fusionControl = new Control('fusion')
    this.antimatterControl = new Control('antimatter')
    this.gwControl = new Control('gw')
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
  update ({converterIndex, converter, player}) {
    this.fusionControl.update({converterIndex, converter})
    this.antimatterControl.update({converterIndex, converter})
    this.gwControl.update({converterIndex, converter})
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
    this.controlStrip = place(ControlStrip)
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
    if (data.player) {
      this.name.textContent = data.player.name
    }
    this.controlStrip.update(data.isCurrentPlayer, data)
  }
}

module.exports = class ConverterControlsStrip {
  constructor () {
    const container = el(
      '.converterControlsStrip',
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
    this.el = list(container, ConverterControls)
    this.el.update([{}, {}, {}])
  }
  update ({players, converter, converterIndex, currentPlayerIndex}) {
    this.el.update(Object.keys(players).map((playerIndex, index) => ({
      converterIndex,
      converter,
      player: players[playerIndex],
      isCurrentPlayer: Number(currentPlayerIndex) === Number(index)
    })))
  }
}
