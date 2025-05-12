const urls = {};

// 'export default async function handler(event)' 대신 'exports.handler = async function(event)' 사용
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'POST 방식만 허용됩니다.' };
  }

  // 에러 처리를 위해 try...catch 블록 추가
  try {
    const { originalUrl } = JSON.parse(event.body || '{}');

    if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
      return { statusCode: 400, body: '올바른 URL을 입력해주세요.' };
    }

    // 고유 코드 생성
    const shortCode = Math.random().toString(36).substring(2, 8);

    // 메모리에 저장
    urls[shortCode] = originalUrl;

    return {
      statusCode: 200,
      body: JSON.stringify({ shortCode }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '서버 오류' }),
    };
  }
};
