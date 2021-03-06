const statics = {
  weapons: {
    one: {
      era: 'one',
      type: 'weapon',
      text: 'weapon',
      url: '/images/pirate.png'
    },
    two: {
      era: 'two',
      type: 'weapon',
      text: 'weapon',
      url: '/images/pirate.png'
    },
    three: {
      era: 'three',
      type: 'weapon',
      text: 'weapon',
      url: '/images/pirate.png'
    }
  },
  wonders: {
    one: {
      era: 'one',
      type: 'wonder',
      text: 'wonder',
      url: '/images/wonder1.png'
    },
    two: {
      era: 'two',
      type: 'wonder',
      text: 'wonder',
      url: '/images/wonder2.png'
    },
    three: {
      era: 'three',
      type: 'wonder',
      text: 'wonder',
      url: '/images/wonder3.png'
    }
  },
  tech: {
    one: {
      two: {
        era: 'one',
        type: 'tech',
        text: 'two',
        url: '/images/discovery1-1.png',
        index: 1
      },
      three: {
        era: 'one',
        type: 'tech',
        text: 'three',
        url: '/images/discovery1-2.png',
        index: 2
      }
    },
    two: {
      two: {
        era: 'two',
        type: 'tech',
        text: 'two',
        url: '/images/discovery2-1.png',
        index: 1
      },
      three: {
        era: 'two',
        type: 'tech',
        text: 'three',
        url: '/images/discovery2-2.png',
        index: 2
      }
    },
    three: {
      two: {
        era: 'three',
        type: 'tech',
        text: 'two',
        url: '/images/discovery3-1.png',
        index: 1
      },
      three: {
        era: 'three',
        type: 'tech',
        text: 'three',
        url: '/images/discovery3-2.png',
        index: 2
      }
    }
  }
}
const flatList = [
  {
    type: 'none'
  },
  {
    era: 'n/a',
    type: 'weapon'
  },
  {
    era: 'one',
    type: 'tech'
  },
  {
    era: 'one',
    type: 'tech'
  },
  {
    era: 'one',
    type: 'wonder'
  },
  {
    era: 'two',
    type: 'tech'
  },
  {
    era: 'two',
    type: 'tech'
  },
  {
    era: 'two',
    type: 'wonder'
  },
  {
    era: 'three',
    type: 'tech'
  },
  {
    era: 'three',
    type: 'tech'
  },
  {
    era: 'three',
    type: 'wonder'
  }
]

const wonderIndices = flatList
  .filter(i => i.type === 'wonder')
  .map(item => flatList.indexOf(item))

const weaponIndex = 1

const eraItems = era => {
  return flatList.filter(i => i.era === era).map((item) => flatList.indexOf(item))
}

const eraWords = ['one', 'two', 'three']
const findItemIndex = (era, index) => {
  if (era === 'n/a') return 1 // pirate, this is an ugly ugly hack
  const item = flatList.filter(item => item.era === eraWords[era - 1])[index - 1]
  return flatList.indexOf(item)
}

const buildingData = {
  fusion: {
    actions: 1,
    points: 0,
    gain: {
      fusion: 20
    }
  },
  antimatter: {
    actions: 1,
    points: 20,
    gain: {
      antimatter: 10
    }
  },
  gw: {
    actions: 1,
    points: 400,
    gain: {
      gw: 5
    }
  },
  wormhole: {
    actions: 1,
    points: 10
  },
  empty: {}
}

module.exports =
  {statics, buildingData, flatList, wonderIndices, weaponIndex, eraItems, findItemIndex}
