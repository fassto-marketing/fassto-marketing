GET /.netlify/functions/getPublisher?url=https://news.naver.com/...

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

  // URL에서 언론사 이름 추출 함수
  function extractPublisherFromUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

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

      for (const domain in publisherMap) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return publisherMap[domain];
        }
      }

      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        const mainDomain = domainParts[domainParts.length - 2];
        if (!['com', 'net', 'org', 'gov', 'edu', 'co', 'go', 'or', 'kr'].includes(mainDomain)) {
          return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
      }

      return hostname;
    } catch (e) {
      return null;
    }
  }

  const extractedPublisher = extractPublisherFromUrl(url);

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Referer': 'https://www.google.com/'
    };

    const response = await axios.get(url, { headers, timeout: 5000 });
    const $ = cheerio.load(response.data);
    const domain = new URL(url).hostname;

    let publisher = '';

    if (domain.includes('etoday.co.kr')) {
      publisher = $('.press_logo img').attr('alt') ||
                  $('meta[property="og:site_name"]').attr('content') ||
                  '이투데이';
    } else if (domain.includes('yna.co.kr')) {
      publisher = $('.media_end_head_top .logo img').attr('alt') ||
                  $('meta[property="og:site_name"]').attr('content') ||
                  '연합뉴스';
    }

    // fallback
    if (!publisher && extractedPublisher) {
      publisher = extractedPublisher;
    }

    if (!publisher) {
      publisher = '언론사 정보 없음';
    }

    console.log('🔍 요청 URL:', url);
    console.log('🌿 추출된 언론사명:', publisher);
    console.log('📦 응답 받은 HTML (300자):', response.data.slice(0, 300));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publisher,
        extractedFrom: publisher === extractedPublisher ? 'url' : 'page',
        url
      })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
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
