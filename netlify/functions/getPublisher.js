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
        'newsgn.com': '뉴스경남',
        'aving.net': '에이빙뉴스',
        'discoverynews.kr': '디스커버리뉴스',
        'polinews.co.kr': '폴리뉴스',
        'fntimes.com': '한국금융신문',
        'newspim.com': '뉴스핌',
        'newspost.kr': '뉴스포스트',
        'newsworks.co.kr': '뉴스웍스',
        'insight.co.kr': '인사이트',
        'thevaluenews.co.kr': '더밸류뉴스',
        'sisaon.co.kr': '시사오늘',
        'businesspost.co.kr': '비즈니스포스트',
        'incheonnews.com': '인천뉴스',
        'incheonin.com': '인천in',
        'nbnews.kr': 'NBN NEWS',
        'dealsite.co.kr': '딜사이트',
        'insightkorea.co.kr': '인사이트코리아',
        'dnews.co.kr': '대한경제',
        'dt.co.kr': '디지털타임스',
        'thebell.co.kr': '더벨',
        'ajunews.com': '아주경제',
        'smedaily.co.kr': '중소기업신문',
        'etnews.com': '전자신문',
        'hansbiz.co.kr': '한스경제',
        'byline.network': '바이라인네트워크',
        'sentv.co.kr': '서울경제TV',
        'zdnet.co.kr': '지디넷코리아',
        'ddaily.co.kr': '디지털데일리',
        'http://kpenews.com': '한국정경신문',
        'globalepic.co.kr': '글로벌에픽',
        'paxetv.com': '팍스경제TV',
        'news.tf.co.kr': '더팩트',
        'bizhankook.com': '비즈한국',
        'techm.kr': '테크M',
        'topstarnews.net': '톱스타뉴스',
        'newsfreezone.co.kr': '뉴스프리존',
        'econovill.com': '이코노믹리뷰',
        'marketnews.co.kr': '마켓뉴스',
        'ntoday.co.kr': '투데이신문',
        'startuptoday.co.kr': '오늘경제',
        'einfomax.co.kr': '연합인포맥스',
        'mediapen.com': '미디어펜',
        'newscape.co.kr': '뉴스케이프',
        'newsquest.co.kr': '뉴스퀘스트',
        'kookje.co.kr': '국제신문',
        'iminju.net': '민주신문',
        'news1.kr': '뉴스1',
        'newstof.com': '뉴스톱',
        'energy-news.co.kr': '에너지신문',
        'busan.com': '부산일보',
        'hellot.net': '헬로티',
        'imwood.co.kr': '나무신문',
        'daily.hankooki.com': '데일리한국',
        'weeklytoday.com': '위클리오늘',
        'srtimes.kr': 'SR타임스',
        'moneys.co.kr': '머니S',
        'viva100.com': '브릿지경제',
        'cio.com': 'CIO Korea',
        'newscham.net': '참세상',
        'sommeliertimes.com': '소믈리에타임즈',
        'wsobi.com': '여성소비자신문',
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
      const pressAlt = $('.press_logo img').attr('alt');
      const ogSiteName = $('meta[property="og:site_name"]').attr('content');
      publisher = pressAlt || ogSiteName || '이투데이';
    } else if (domain.includes('yna.co.kr')) {
      const logoAlt = $('.media_end_head_top .logo img').attr('alt');
      const ogSiteNameYna = $('meta[property="og:site_name"]').attr('content');
      publisher = logoAlt || ogSiteNameYna || '연합뉴스';
    }

    if (!publisher && extractedPublisher) {
      publisher = extractedPublisher;
    }

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
