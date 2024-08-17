const app = require('../index');
const { VercelResponse, VercelRequest } = require('@vercel/node');

module.exports = (req = VercelRequest, res = VercelResponse) => {
  app(req, res);
};
