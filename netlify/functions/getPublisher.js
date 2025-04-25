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

  // URL에서 언론사 이름 추출 (백업용)
  function extractPublisherFromUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      
      // 주요 언론사 도메인 매핑
      const publisherMap = {
        'news.naver.com': '네이버뉴스',
        'news.nate.com': '네이트뉴스',
        'news.daum.net': '다음뉴스',
        'yna.co.kr': '연합뉴스',
        'yonhapnews.co.kr': '연합뉴스',
        'mt.co.kr': '머니투데이',
        'mk.co.kr': '매일경제',
        'hankyung.com': '한국경제',
        'chosun.com': '조선일보',
        'donga.com': '동아일보',
        'hani.co.kr': '한겨레',
        'joongang.co.kr': '중앙일보',
        'kmib.co.kr': '국민일보',
        'edaily.co.kr': '이데일리',
        'sedaily.com': '서울경제',
        'fnnews.com': '파이낸셜뉴스',
        'asiae.co.kr': '아시아경제',
        'nocutnews.co.kr': '노컷뉴스',
        'newsis.com': '뉴시스',
        'heraldcorp.com': '헤럴드경제',
        'etoday.co.kr': '이투데이',
        'sbs.co.kr': 'SBS',
        'imbc.com': 'MBC',
        'kbs.co.kr': 'KBS',
        'veritas-a.com': '베리타스알파',
        'bizwnews.com': '비즈월드',
        'klnews.co.kr': '물류신문',
        'finomy.com': '현대경제신문',
        'asiatime.co.kr': '아시아타임즈',
        'naeil.com': '내일신문',
        'asiatoday.co.kr': '아시아투데이',
        'pressian.com': '프레시안',
        'venturesquare.net': '벤처스퀘어',
        'newsgn.com': '뉴스경남'
      };

      // 정확한 매칭 확인
      for (const domain in publisherMap) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return publisherMap[domain];
        }
      }

      // 도메인의 주요 부분 추출
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        const mainDomain = domainParts[domainParts.length - 2];
        // 일반적인 최상위 도메인이나 국가 코드가 아닌지 확인
        if (!['com', 'net', 'org', 'gov', 'edu', 'co', 'go', 'or', 'kr'].includes(mainDomain)) {
          // 첫 글자를 대문자로 변환
          return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
      }
      
      return hostname;
    } catch (e) {
      return null;
    }
  }

  // URL에서 추출한 언론사 이름(백업용)
  const extractedPublisher = extractPublisherFromUrl(url);

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://www.google.com/'
    };
    
    const response = await axios.get(url, { headers, timeout: 5000 });  // 타임아웃 추가
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
    // 기존 다른 도메인 처리 코드...

    // 언론사 정보가 없을 경우, URL에서 추출한 정보 사용
    if (!publisher && extractedPublisher) {
      publisher = extractedPublisher;
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
        extractedFrom: publisher === extractedPublisher ? 'url' : 'page',
        url: url // 디버깅용 URL 정보
      })
    };
  } 
  catch (error) {
    // 오류 발생 시 URL에서 추출한 언론사 이름 반환
    return {
      statusCode: 200,  // 성공 응답 코드로 변경
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        publisher: extractedPublisher || '언론사 정보 없음',
        extractedFrom: 'url',
        error: error.message
      })
    };
  }
};
