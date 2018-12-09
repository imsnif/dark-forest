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
    this.el = el(
      '.converterModal',
      this.minusActionIndication,
      new ConverterControlsStrip(),
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
        }
      }
    )
  }
  update (data) {

  }
}
