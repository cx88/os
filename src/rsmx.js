const { spawn } = require('child_process')
const smhttp = require('./smhttp')

const tryParse = json => {
  try {
    return JSON.parse(json)
  } catch(e) {
    return null
  }
}

const Remote = class {
  constructor() {
    this.login = null
  }
  setLogin(name, token) {
    this.login = { name, token }
  }
}

const RemoteManager = class extends Remote {
  constructor() {
    super()
  }
  process(client, message) {

  }
  listen(port) {
    http.createServer((req, res) => {
      res.writeHead(200)
      res.end('k')
    }).on('upgrade', (req, socket, head) => {
      let client = {}
      let buffer = head.toString('utf8')
      socket.setEncoding('utf8')
      socket.on('data', data => {
        buffer += data
        let parts = buffer.split('\x00')
        buffer = parts.pop()
        for (let part of parts)
          this.process(client, tryParse(part))
      })
      socket.write([
        'HTTP/1.1 101',
        'Upgrade: rmsx',
        'Connection: Upgrade',
      ].map(r => r + '\r\n').join(''))
    }).listen(port)
  }
}

const RemoteClient = class extends Remote {
  constructor() {
    super()
  }
  process(message) {

  }
  connect(host, port) {
    http.request({
      port,
      host,
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'rmsx',
      }
    }).on('upgrade', (res, socket, head) => {
      let buffer = head.toString('utf8')
      socket.setEncoding('utf8')
      socket.on('data', data => {
        buffer += data
        let parts = buffer.split('\x00')
        buffer = parts.pop()
        for (let part of parts)
          this.process(tryParse(part))
      })
    }).end()
  }
}

const RemoteWorker = class extends RemoteClient {
  constructor() {
    super()
    this.evaluate = eval
  }
  spawnPty(command) {
    let commandString = JSON.stringify(Array.from(command).map(r => r.toString()))
    return spawn('python', ['-c', `import pty\npty.spawn(${ commandString) })`])
  }
  setEvalHook(evaluate) {
    this.evaluate = evaluate
  }
  process(message) {

  }
}

const RemoteController = class extends RemoteClient {
  constructor() {
    super()
  }
  process(message) {

  }
}

RemoteWorker.RemoteManager = RemoteManager
RemoteWorker.RemoteWorker = RemoteWorker
RemoteWorker.RemoteController = RemoteController
module.exports = RemoteWorker

/*
const http = require('http');

// Create an HTTP server
const srv = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');
});
srv.on('upgrade', (req, socket, head) => {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket); // echo back
});

// now that server is running
srv.listen(1337, '127.0.0.1', () => {

  // make a request
  const options = {
    port: 1337,
    host: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  const req = http.request(options);
  req.end();

  req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('got upgraded!');
    socket.end();
    process.exit(0);
  });
});
*


 */
/*
let rc = new RemoteClient()
rc.setLogin(c.NAME, ROOT)
rc.setEvalHook(query => eval(query))
rc.connect('ip-ba.arras.io', 7447)

let rs = new RemoteServer()
rs.setLogin('lb', ROOT)
rs.listen(7447)
 */
/*
var fs = require('fs');
var net = require('net');
var http = require('http');
var https = require('https');

var baseAddress = 3000;
var redirectAddress = 3001;
var httpsAddress = 3002;
var httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

net.createServer(function tcpConnection(conn) {
    conn.once('data', function (buf) {
        var proxy = net.createConnection('/tmp/test.http', function () {
            proxy.write(buf);
            conn.pipe(proxy).pipe(conn);
        });
    });
}).listen(1338)

http.createServer(httpConnection).listen(redirectAddress);
https.createServer(httpsOptions, httpsConnection).listen(httpsAddress);



function httpConnection(req, res) {
    var host = req.headers['host'];
    res.writeHead(301, { "Location": "https://" + host + req.url });
    res.end();
}

function httpsConnection(req, res) {
    res.writeHead(200, { 'Content-Length': '5' });
    res.end('HTTPS');
}
*/
