'use strict'

const { el } = require('redom')
const TopBar = require('./top-bar')
const UniversePane = require('./universe-pane')
const LogPane = require('./log-pane')
const MetaPane = require('./meta-pane')
const ConverterModal = require('./converter-modal')

const backgroundUrl = '/images/background.png'

const className = '.game'
const style = {
  width: '1024px',
  height: '768px',
  display: 'grid',
  gridTemplateColumns: '229px 491px 240px',
  gridTemplateRows: '100%',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  position: 'absolute',
  justifyContent: 'space-between'
}

const backgroundImageStyle = {
  width: '100%',
  height: '100%',
  position: 'fixed',
  backgroundImage: `url(${backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center'
}

module.exports = class App {
  constructor () {
    this.topBar = new TopBar()
    this.logPane = new LogPane()
    this.universePane = new UniversePane()
    this.metaPane = new MetaPane()
    this.converterModal = new ConverterModal()

    this.game = el(className,
      this.logPane,
      this.universePane,
      this.metaPane,
      {style}
    )
    this.el = el(
      '.background-image',
      this.topBar,
      this.converterModal,
      this.game,
      {
        style: backgroundImageStyle
      }
    )
  }
  update (data) {
    this.topBar.update(data)
  }
}
