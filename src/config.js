const fs = require('fs')

let attempts = [
  () => {
    let envFile = fs.readFileSync(__dirname + '/.env')
    let env = {}
    for (let line of envFile.split('\n')) {
      line = line.trim()
      if (line.startsWith('#')) continue
      line = line.split('=')
      env[line.shift()] = line.join('=')
    }
    return env
  },
  () => require('../private.json'),
  () => require('../../private.json'),
  () => process.env,
]

let env = {}
for (let attempt of attempts) {
  let result
  try {
    result = attempt()
  } catch (e) {
    continue
  }
  for (let [key, value] of Object.entries(result))
    if (!env[key])
      env[key] = value
}

module.exports = env
