// shorten.js에서 저장된 urls 객체를 같은 파일 내 공유
const urls = require('./shorten').urls;

exports.handler = async function (event) {
  const code = event.queryStringParameters.code;
  const url = urls && urls[code];

  if (!url) {
    return {
      statusCode: 404,
      body: '유효하지 않은 단축 URL입니다.',
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
};
