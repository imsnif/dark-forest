const { el } = require('redom')

const ConverterControlsStrip = require('./converter-controls-strip')

module.exports = class ConverterModal {
  constructor () {
    this.minusActionIndication = el('img', {
      src: '/images/minus-one-action.png',
      style: {
        alignSelf: 'center',
        justifySelf: 'center'
      }
    })
    this.converterControlsStrip = new ConverterControlsStrip()
    this.el = el(
      '.converterModal',
      this.minusActionIndication,
      this.converterControlsStrip,
      {
        style: {
          visibility: 'hidden',
          display: 'grid',
          gridTemplateRows: '50px 145px 110px 215px',
          gridAutoColums: '100%',
          height: '595px',
          width: '684px',
          position: 'absolute',
          zIndex: 1000,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundImage: 'url(/images/modal-background.png)',
          backgroundSize: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          gridGap: '10px'
        },
        onclick: e => {
          e.stopPropagation() // TODO: prevent modal hiding better
        }
      }
    )
  }
  update (data) {
    const {
      converterModalOpen,
      currentPlayer,
      leftOpponents,
      rightOpponents
    } = data
    const { converter1, converter2, converter3 } = currentPlayer
    const converters = { // TODO: do this in store, preferably as array
      1: converter1,
      2: converter2,
      3: converter3
    }
    if (converterModalOpen) {
      const allPlayers = [
        leftOpponents[1] || {},
        leftOpponents[0] || {},
        currentPlayer || {},
        rightOpponents[0] || {},
        rightOpponents[1] || {}
      ]
      const players = {
        1: allPlayers[converterModalOpen - 1],
        2: allPlayers[converterModalOpen],
        3: allPlayers[converterModalOpen + 1]
      }
      this.converterControlsStrip.update({
        players,
        converter: converters[converterModalOpen],
        converterIndex: converterModalOpen,
        currentPlayerIndex: Number(converterModalOpen) === 1 // TODO: better
          ? 2 : Number(converterModalOpen) === 2
            ? 1 : Number(converterModalOpen) === 3
              ? 0 : null
      })
      this.el.style.visibility = 'visible'
    } else {
      this.el.style.visibility = 'hidden'
    }
  }
}
