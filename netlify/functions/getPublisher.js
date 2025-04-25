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

    const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com/'
  };
    
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // 언론사명 추출 개선 부분
    let publisher = '';
    const domain = new URL(url).hostname;
    
   // 도메인별 맞춤 처리 추가
    if (domain.includes('etoday.co.kr')) {
      publisher = $('.press_logo img').attr('alt') || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '이투데이';
    } 
    else if (domain.includes('yna.co.kr')) {
      publisher = $('.media_end_head_top .logo img').attr('alt') || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '연합뉴스';
    }
    else if (domain.includes('ilyo.co.kr')) {
      publisher = $('.press_logo span').text() || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '일요신문';
    }
    else if (domain.includes('techm.kr')) {
      publisher = $('.article-header-wrap .media').text() || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '테크M';
    }
    else if (domain.includes('dealsite.co.kr')) {
      publisher = $('meta[property="og:site_name"]').attr('content') || '딜사이트';
    }
    else if (domain.includes('newsis.com')) {
      publisher = $('.header-logo img').attr('alt') || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '뉴시스';
    }
    else if (domain.includes('insightkorea.co.kr')) {
      publisher = $('.tit_media img').attr('alt') || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '인사이트코리아';
    }
    else if (domain.includes('aving.net')) {
      publisher = $('.header-logo-wrap img').attr('alt') || 
                  $('meta[property="og:site_name"]').attr('content') || 
                  '에이빙';
    }
    else {
      // 기존 추출 방법 (변경 없음)
      publisher = $('meta[property="og:site_name"]').attr('content');
      
      if (!publisher) {
        publisher = $('meta[name="media"]').attr('content') || 
                    $('meta[name="publisher"]').attr('content') || 
                    $('meta[name="author"]').attr('content');
      }
      
      if (!publisher) {
        // 네이버 뉴스의 경우
        publisher = $('.media_end_head_top .media_end_head_top_logo img').attr('alt') ||
                    $('.press_logo img').attr('alt') ||
                    $('.c_inner .logo_area img').attr('alt');
      }
      
      if (!publisher) {
        const titleText = $('title').text();
        const titleParts = titleText.split('|');
        if (titleParts.length > 1) {
          publisher = titleParts[titleParts.length - 1].trim();
        }
      }
      
      if (!publisher) {
        publisher = $('.publisher').text().trim() ||
                    $('.source').text().trim() ||
                    $('.news_agency').text().trim();
      }
    }
    
    // 언론사 정보가 없을 경우 도메인으로 대체 (새로 추가)
    if (!publisher) {
      // 도메인에서 언론사명 추출 시도
      const domainParts = domain.split('.');
      if (domainParts.length >= 2) {
        // www.example.co.kr -> example 추출
        publisher = domainParts[domainParts.length === 4 ? 1 : 0];
        // 첫 글자를 대문자로 변환
        publisher = publisher.charAt(0).toUpperCase() + publisher.slice(1);
      } else {
        publisher = domain;
      }
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
