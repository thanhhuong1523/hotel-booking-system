const ws = require('ws');
const logger = require('../middleware/winston.logger');

let wss = null;

// Initialize WebSocket server
exports.initWebSocket = (server) => {
  wss = new ws.Server({ server });

  wss.on('connection', (socket) => {
    logger.info('New WebSocket connection established.');

    socket.on('message', (message) => {
      logger.info(`Received WebSocket message: ${message}`);
    });

    socket.on('close', () => {
      logger.info('WebSocket connection closed.');
    });
  });

  return wss;
};

// Broadcast a message to all connected clients
exports.broadcast = (data) => {
  if (!wss) {
    logger.warn('WebSocket server not initialized.');
    return;
  }

  const messageString = typeof data === 'string' ? data : JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(messageString);
    }
  });
};
