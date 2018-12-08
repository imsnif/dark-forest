const { el } = require('redom')
const colors = require('./colors')

const className = '.meta-pane'

const style = {
  backgroundColor: '#4d4d4d',
  height: '26px',
  width: '100%',
  top: 0,
  left: 0,
  position: 'fixed',
  display: 'grid',
  gridTemplateColumns: '65px 65px 1fr 65px 65px 65px'
}

const actionIcon = '/images/top-bar-action-icon.png'
const pointsIcon = '/images/top-bar-point-icon.png'
const fusionIcon = '/images/top-bar-fusion-icon.png'
const antimatterIcon = '/images/top-bar-antimatter-icon.png'
const gwIcon = '/images/top-bar-gw-icon.png'

class TopBarStatus {
  constructor (icon, number) {
    this.icon = el('img', {
      src: icon,
      style: {
        alignSelf: 'center',
        justifySelf: 'center'
      }
    })
    this.count = el('.score', {
      textContent: number,
      style: {
        color: colors.positive,
        justifySelf: 'start',
        alignSelf: 'center',
        fontSize: '19px',
        fontWeight: 'bold'
      }
    })
    this.el = el('.actions-left', this.icon, this.count, {
      style: {
        display: 'grid',
        gridTemplateColumns: '25px 40px',
        gridGap: '5px',
        marginLeft: '10px'
      }
    })
  }
  update (data) {
    this.count.textContent = data
  }
}

module.exports = class TopBar {
  constructor () {
    this.actionsLeft = new TopBarStatus(actionIcon, 2)
    this.points = new TopBarStatus(pointsIcon, 100)
    this.fusion = new TopBarStatus(fusionIcon, 5)
    this.antimatter = new TopBarStatus(antimatterIcon, 90)
    this.gw = new TopBarStatus(gwIcon, 1)
    this.el = el(className,
      this.actionsLeft,
      this.points,
      el('div'),
      this.fusion,
      this.antimatter,
      this.gw,
      {style}
    )
  }
  update (data) {
    const { actionsLeft, points, fusion, antimatter, gw } = data
    this.actionsLeft.textContent = actionsLeft
    this.points.textContent = points
    this.fusion.textContent = fusion
    this.antimatter.textContent = antimatter
    this.gw.textContent = gw
  }
}
