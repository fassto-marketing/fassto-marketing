const fs = require('fs');
const path = require('path');
const FILE_PATH = path.resolve('/tmp/urls.json');

exports.handler = async function (event) {
  const code = event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 302, headers: { Location: '/url-cut.html' } };
  }

  let urls = {};
  try {
    if (fs.existsSync(FILE_PATH)) {
      urls = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    }
  } catch (e) {}

  const originalUrl = urls[code];
  if (!originalUrl) {
    return {
      statusCode: 302,
      headers: { Location: '/url-cut.html?error=notfound' }
    };
  }

  return {
    statusCode: 302,
    headers: { Location: originalUrl }
  };
};
