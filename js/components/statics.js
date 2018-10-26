const statics = {
  weapons: {
    zero: {
      era: 'zero',
      type: 'weapon',
      text: 'weapon'
    },
    one: {
      era: 'one',
      type: 'weapon',
      text: 'weapon'
    },
    two: {
      era: 'two',
      type: 'weapon',
      text: 'weapon'
    }
  },
  wonders: {
    zero: {
      era: 'zero',
      type: 'wonder',
      text: 'wonder'
    },
    one: {
      era: 'one',
      type: 'wonder',
      text: 'wonder'
    },
    two: {
      era: 'two',
      type: 'wonder',
      text: 'wonder'
    }
  },
  tech: {
    zero: {
      one: {
        era: 'zero',
        type: 'tech',
        text: 'one'
      },
      two: {
        era: 'zero',
        type: 'tech',
        text: 'two'
      }
    },
    one: {
      one: {
        era: 'one',
        type: 'tech',
        text: 'one'
      },
      two: {
        era: 'one',
        type: 'tech',
        text: 'two'
      }
    },
    two: {
      one: {
        era: 'two',
        type: 'tech',
        text: 'one'
      },
      two: {
        era: 'two',
        type: 'tech',
        text: 'two'
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
      tList.push(statics[type][era].one)
      tList.push(statics[type][era].two)
      return tList
    }, [])
    return list.concat(techList)
  }
  return list
}, []))
module.exports = {statics, flatList}
