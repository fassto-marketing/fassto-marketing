GET /.netlify/functions/getPublisher?url=https://news.naver.com/...

// netlify/functions/getPublisher.js
const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event) {
  const url = event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL이 제공되지 않았습니다.' })
    };
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 언론사명 추출 (meta og:site_name 또는 title 참고)
    let publisher = $('meta[property="og:site_name"]').attr('content')
                    || $('meta[name="media"]').attr('content')
                    || $('title').text().split('|')[1]?.trim();

    if (!publisher) {
      publisher = '언론사 정보 없음';
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publisher })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '언론사 정보를 가져오는 중 오류 발생', detail: error.message })
    };
  }
};
