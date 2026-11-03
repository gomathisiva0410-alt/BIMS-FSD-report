// Runs the Express backend (backend/server.js) as a Netlify Function.
process.env.SERVERLESS = '1';

const serverless = require('serverless-http');
const connectDB = require('../../backend/config/db');
const { app } = require('../../backend/server');

// Normalise the path so Express sees /api/... whether invoked via the
// /api/* rewrite or directly at /.netlify/functions/api/...
const wrapped = serverless(app, {
  request(req) {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = '/api' + req.url.slice('/.netlify/functions/api'.length);
    }
  },
});

let connecting = null;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (!connectDB.isConnected()) {
    connecting = connecting || connectDB().catch((err) => {
      connecting = null;
      throw err;
    });
    try {
      await connecting;
    } catch (err) {
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Database unavailable. Set the MONGODB_URI environment variable in Netlify.',
        }),
      };
    }
  }
  return wrapped(event, context);
};
