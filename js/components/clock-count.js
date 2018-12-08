const { el } = require('redom')
const colors = require('./colors')

const className = '.clockCount'

module.exports = class ClockCount {
  constructor () {
    this.clockImage = el('img', {
      src: '/images/clock.png',
      style: {
        alignSelf: 'center'
      }
    })
    this.countDown = el('.countdown', {
      textContent: '00:32',
      style: {
        alignSelf: 'center',
        color: colors.information,
        fontSize: '50px',
        fontWeight: 'bold'
      }
    })
    this.el = el(className,
      this.clockImage,
      this.countDown,
      {
        style: {
          alignSelf: 'center',
          justifySelf: 'center',
          display: 'grid',
          gridTemplateColumns: '2fr 5fr',
          gridGap: '2px'
        }
      }
    )
  }
  update (timeString) {
    this.countDown.textContent = timeString
  }
}
