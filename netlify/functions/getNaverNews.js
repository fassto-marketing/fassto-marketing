// getNaverNews.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  const query = event.queryStringParameters.query || '파스토';
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=5&sort=date`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': 'aJ1lgNaPNguAe0nhTb26',
        'X-Naver-Client-Secret': 'crk8ObUpST'
      }
    });

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
