const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  const code = event.queryStringParameters.code;
  const store = getStore('urls');
  const data = await store.getJSON(code);

  if (!data || !data.originalUrl) {
    return {
      statusCode: 404,
      body: '해당 코드로 저장된 URL이 없습니다.',
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: data.originalUrl,
    },
  };
};
