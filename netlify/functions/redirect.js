const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve('/tmp/urls.json');

exports.handler = async function (event) {
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: 'code 값이 필요합니다.',
    };
  }

  let urls = {};
  try {
    if (fs.existsSync(FILE_PATH)) {
      const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
      urls = JSON.parse(fileData);
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: '파일을 읽는 중 오류가 발생했습니다.',
    };
  }

  const originalUrl = urls[code];

  if (!originalUrl) {
    return {
      statusCode: 404,
      body: '해당 코드에 대한 URL을 찾을 수 없습니다.',
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: originalUrl,
    },
  };
};
