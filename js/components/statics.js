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
const flatList = [ // TODO: just write flat list
  {type: 'none', era: 'none', text: '...'}
].concat(Object.keys(statics).reduce((list, type) => {
  if (type === 'weapons') {
    const weaponList = Object.keys(statics[type]).reduce((wList, era) => {
      wList.push(statics[type][era])
      return wList
    }, [])
    return list.concat(weaponList)
  } else if (type === 'wonders') {
    const wonderList = Object.keys(statics[type]).reduce((wList, era) => {
      wList.push(statics[type][era])
      return wList
    }, [])
    return list.concat(wonderList)
  } else if (type === 'tech') {
    const techList = Object.keys(statics[type]).reduce((tList, era) => {
      tList.push(statics[type][era].two)
      tList.push(statics[type][era].three)
      return tList
    }, [])
    return list.concat(techList)
  }
  return list
}, []))
module.exports = {statics, flatList}
