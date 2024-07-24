const { createServer } = require('http');
const app = require('../app'); // Assurez-vous que le chemin est correct

const server = createServer(app);

module.exports = (req, res) => {
  server.emit('request', req, res);
};
