/* eslint-disable no-magic-numbers */

// implementation borrowed from:
// https://github.com/myrne/performance-now/blob/6223a0d544bae1d5578dd7431f78b4ec7d65b15c/src/performance-now.coffee
let hrtime = process.hrtime

function getNanoSeconds() {
  let highRes = hrtime()
  return highRes[0] * 1e9 + highRes[1]
}

let loadTime = getNanoSeconds()

function timeStamp() {
  return (getNanoSeconds() - loadTime) / 1e6
}

export default class Measure {
  constructor() {
    this.marks = {}
    this.entries = []
  }

  start(name) {
    let startTime = timeStamp()
    this.marks[name] = startTime
  }

  stop(name) {
    let endTime = timeStamp()
    let startTime = this.marks[name]

    if (!startTime) {
      throw new Error(`no known mark: ${name}`)
    }

    this.entries.push({
      startTime,
      name,
      duration: endTime - startTime
    })
  }

  print() {
    this.entries.forEach((measurement) => {
      console.log(`- ${measurement.name}: ${measurement.duration.toFixed(2)}ms`)
    })
    this.entries.length = 0
  }
}
