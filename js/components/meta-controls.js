const { el } = require('redom')

module.exports = class MetaControls {
  constructor () {
    this.el = el('.metaControls', { style: {
      backgroundImage: 'url(/images/meta-controls.png)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      alignSelf: 'bottom'
    }})
  }
  update (data) {

  }
}
