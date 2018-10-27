const { el, list } = require('redom')

const Action = require('./action')

const className = '.inventory'
const style = {
  alignSelf: 'center',
  justifySelf: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  backgroundColor: '#212121',
  // backgroundColor: 'purple',
  display: 'grid',
  //  gridGap: '100px',
  //  alignItems: 'center',
  //  justifyContent: 'center',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gridGap: '20px',
  gridAutoRows: '80px',
  height: '100%',
  width: '80%'
}

const oneToTwelve = Array(12)
  .fill(1).map((one, index) => index + 1)

const initialState = oneToTwelve.map(
  actionIndex => ({actionIndex, disabled: false})
)

module.exports = class Inventory {
  constructor () {
    this.el = el(className,
      {style}
    )
    this.list = list(this.el, Action)
    this.list.update(initialState)
  }
  update (data) {
    this.list.update(oneToTwelve.map(actionIndex => ({
      actionIndex,
      disabled: data.indexOf(actionIndex) > -1
    })))
  }
}
