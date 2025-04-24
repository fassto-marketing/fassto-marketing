const fs = require('fs');
const path = require('path');
const FILE_PATH = path.resolve('/tmp/urls.json');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  const { originalUrl } = JSON.parse(event.body || '{}');
  if (!originalUrl || !originalUrl.startsWith('http')) {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  const shortCode = Math.random().toString(36).substring(2, 8);
  let urls = {};
  try {
    if (fs.existsSync(FILE_PATH)) {
      urls = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    }
  } catch (e) {}

  urls[shortCode] = originalUrl;
  fs.writeFileSync(FILE_PATH, JSON.stringify(urls), 'utf-8');

  return {
    statusCode: 200,
    body: JSON.stringify({ shortCode }),
  };
};
