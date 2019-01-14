const fs = require('fs')
const https = require('https')
const path = require('path')
const EventEmitter = require('events')

const serveStatic = folder => (req, res) => {
  let fileDanger = req.url || 'index.html'
  let file = path.join(__dirname, '..', folder, path.resolve('/' + fileDanger))
  fs.stat(file, (err, stat) => {
    if (err) {
      res.writeHead(404)
      res.end('404')
      return
    }

    let { size, mtime } = stat
    let ifModifiedSince = req.headers['if-modified-since']
    let isModifiedSince = mtime.toUTCString()

    if (ifModifiedSince === isModifiedSince) {
      res.writeHead(304, {
        'Last-Modified': isModifiedSince,
      })
      res.end()
    } else {
      res.writeHead(200, {
        'Content-Length': size,
        'Last-Modified': isModifiedSince,
      })
      fs.createReadStream(file).pipe(res).once('error', () => stream.end())
    }
  })
}

const Server = class extends EventEmitter {
  constructor(options, listener) {
    super()
    this.options = options
    if (listener)
      this.on('request', listener)
  }
  listen(...args) {
    https.createServer(this.options, (req, res) => {
      this.emit('request', req, res)
    }).on('upgrade', (req, socket, head) => {
      if (req.headers.upgrade !== 'rmsx') {
        socket.end('HTTP/1.1 400\r\n')
      } else {
        socket.write([
          'HTTP/1.1 101',
          'Upgrade: rmsx',
          'Connection: Upgrade',
        ].map(r => r + '\r\n').join(''))
        this.emit('connection', socket, head)
      }
    }).listen(...args)
  }
}

const Client = class extends EventEmitter {
  constructor(host, port) {
    super()
    if (host)
      this.connect(host, port)
  }
  connect(host, port) {
    https.request({
      port,
      host,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'rmsx',
      }
    }, res => {
      this.emit('error', new Error('Upgrade required.'), res)
    }).on('upgrade', (res, socket, head) => {
      this.emit('open', socket, head)
    }).on('error', error => {
      this.emit('error', error)
    }).end()
  }
}

module.exports = {
  createServer(...args) {
    return new Server(...args)
  },
  connect(...arg) {
    return new Client(...arg)
  },
  serveStatic,
}
