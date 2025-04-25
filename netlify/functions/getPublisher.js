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

    // 언론사명 추출 개선 부분
    let publisher = '';
    
    // 방법 1: meta 태그에서 og:site_name 확인
    publisher = $('meta[property="og:site_name"]').attr('content');
    
    // 방법 2: 언론사 전용 meta 태그 확인
    if (!publisher) {
      publisher = $('meta[name="media"]').attr('content') || 
                  $('meta[name="publisher"]').attr('content') || 
                  $('meta[name="author"]').attr('content');
    }
    
    // 방법 3: 네이버 뉴스의 경우 특정 클래스나 ID 활용
    if (!publisher) {
      // 네이버 뉴스의 경우
      publisher = $('.media_end_head_top .media_end_head_top_logo img').attr('alt') ||
                  $('.press_logo img').attr('alt') ||
                  $('.c_inner .logo_area img').attr('alt');
    }
    
    // 방법 4: 제목에서 추출 시도
    if (!publisher) {
      const titleText = $('title').text();
      const titleParts = titleText.split('|');
      if (titleParts.length > 1) {
        publisher = titleParts[titleParts.length - 1].trim();
      }
    }
    
    // 방법 5: 특정 언론사별 맞춤 선택자
    if (!publisher) {
      publisher = $('.publisher').text().trim() ||
                  $('.source').text().trim() ||
                  $('.news_agency').text().trim();
    }
    
    // 언론사 정보가 없을 경우 기본값 설정
    if (!publisher) {
      publisher = '언론사 정보 없음';
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publisher: publisher,
        method: '찾은 방법 정보', // 어떤 방법으로 찾았는지 표시
        url: url // 디버깅용 URL 정보
    })
  }; 
  
  catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '언론사 정보를 가져오는 중 오류 발생', detail: error.message })
    };
  }
};
