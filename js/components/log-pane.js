const { el, list, setStyle } = require('redom')

const className = '.log-pane'

const backgroundUrl = '/images/log-pane.png'

const style = {
  backgroundImage: `url(${backgroundUrl})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center'
}

module.exports = class LogPane {
  constructor () {
    this.el = el(className,
      {style}
    )
  }
  update (data) {

  }
}
