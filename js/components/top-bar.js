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
    this.actionsLeft = new TopBarStatus(actionIcon, '???')
    this.points = new TopBarStatus(pointsIcon, '???')
    this.fusion = new TopBarStatus(fusionIcon, '???')
    this.antimatter = new TopBarStatus(antimatterIcon, '???')
    this.gw = new TopBarStatus(gwIcon, '???')
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
    this.actionsLeft.update(actionsLeft)
    this.points.update(points)
    this.fusion.update(fusion)
    this.antimatter.update(antimatter)
    this.gw.update(gw)
  }
}
