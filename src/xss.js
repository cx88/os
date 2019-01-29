const fs = require('fs')
const https = require('https')
const path = require('path')
const EventEmitter = require('events')

const serveStatic = folder => (req, res) => {
  let fileDanger = req.url.length > 1 ? req.url : 'index.html'
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

const Socket = class extends EventEmitter {
  constructor(socket, head) {
    super()
    let buffer = head.toString('utf8')
    socket.setEncoding('utf8')
    socket.on('data', data => {
      buffer += data
      let parts = buffer.split('\x00')
      buffer = parts.pop()
      for (let part of parts)
        try {
          this.emit('message', JSON.parse(part))
        } catch(e) {
          this.close()
        }
    })
    this.socket = socket
  }
  send(data) {
    this.socket.write(JSON.stringify(data) + '\x00')
  }
  close() {
    this.socket.end()
  }
}

const Server = class extends EventEmitter {
  constructor(options = {}, listener) {
    super()
    if (listener)
      this.on('request', listener)
    let server = https.createServer(options, (req, res) => {
      this.emit('request', req, res)
    })
    server.on('upgrade', (req, socket, head) => {
      if (req.headers.upgrade !== 'xsocket') {
        socket.end('HTTP/1.1 400\r\n')
      } else {
        socket.write([
          'HTTP/1.1 101',
          'Connection: Upgrade',
          'Upgrade: xsocket',
          '',
          '',
        ].join('\r\n'))
        this.emit('connection', new Socket(socket, head))
      }
    })
    this.server = server
  }
  listen(...args) {
    this.server.listen(...args)
  }
}

const Client = class extends EventEmitter {
  constructor(host, port = 443) {
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
        'Upgrade': 'xsocket',
      }
    }, res => {
      this.emit('error', new Error('Upgrade required.'), res)
    }).on('upgrade', (res, socket, head) => {
      this.emit('open', new Socket(socket, head))
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
