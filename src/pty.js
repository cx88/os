const { spawn } = require('child_process')
const EventEmitter = require('events')

let makePython = (file, args) => {
  let commandString = JSON.stringify([file, ...args].map(r => r.toString()))
  return ['python', ['-c', `import pty\npty.spawn(${ commandString })`]]
}

const Terminal = class extends EventEmitter {
  constructor(file, args = [], settings = {}) {
    if (typeof file !== 'string')
      throw new TypeError('The "file" argument must be of type string')
    if (!Array.isArray(args))
      throw new TypeError('The "args" argument must be an array')
    super()

    let { usePython = true } = settings
    if (usePython)
      [file, args] = makePython(file, args)
    this.spawn(file, args, settings)
  }
  spawn(file, args, settings) {
    let ps = spawn(file, args, settings)
    ps.stdout.on('data', data => this.emit('data', data, false))
    ps.stderr.on('data', data => this.emit('data', data, true))
    ps.once('exit', (code, signal) => {
      this.alive = false
      this.emit('exit', code, signal)
    })
    ps.on('error', err => this.emit('error', err))
    this.ps = ps
    this.alive = true
  }
  write(data) {
    if (this.alive)
      this.ps.stdin.write(data)
  }
  kill(signal) {
    if (this.alive)
      this.ps.kill(signal)
    this.alive = false
  }
}

module.exports = Terminal
