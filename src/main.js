const fs = require('fs')
const http = require('http')

const config = require('./config')
const smhttps = require('./smhttps')
const pty = require('./pty')

process.title = 'rsmx'

const server = smhttps.createServer({
  key: fs.readFileSync('/root/.acme.sh/lb.arras.io/lb.arras.io.key'),
  cert: fs.readFileSync('/root/.acme.sh/lb.arras.io/lb.arras.io.cer'),
}, smhttps.serveStatic('public'))
server.on('connection', (socket, head) => {

})
server.listen(7447, () => {
  console.log('[RSMX] Manager listening on port 7447.')
})

/*wss.on('connection', ws => {
  ws.on('message', message => {
    console.log('received: %s', message)
  })

  ws.send('something')
})

server.listen(process.env.PORT || 8080, () => {
  console.log(`Listening on port ${ server.address().port }`)
})


wss.on('connection', ws => {
  console.log(`${ new Date().toGMTString() } Connection accepted.`)
  const term = spawn('/usr/bin/env', args, {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
  })

  console.log(`${ new Date().toGMTString() } Process #${term.pid} started.`)
  term.on('data', data => ws.emit('output', data))
  term.on('exit', code => {
    console.log(`${ new Date().toGMTString() } Process #${term.pid} ended.`)
    ws.close()
  })
  ws.on('resize', ({ col, row }) => term.resize(col, row))
  ws.on('input', input => term.write(input))
  ws.on('disconnect', () => {
    term.end()
    term.destroy()
  })
})



const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const server = new https.createServer({
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/key.pem')
});
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

server.listen(8080);*/
