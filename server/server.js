const { app, wss } = require('./app.js');

function createServer(port) {
  const server = app.listen(port);

  server.on('upgrade', (request, socket, head) => {
    console.log('Upgrade request');
    wss.handleUpgrade(request, socket, head, (socket2) => {
      wss.emit('connection', socket2, request);
    });
  });

  return server;
}

module.exports = createServer;
