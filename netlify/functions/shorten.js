const { getDeployStore } = require('@netlify/blobs');

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

    const shortCode = Math.random().toString(36).substring(2, 8);
    const store = getDeployStore('.netlify/blobs/deploy'); // Netlify Blob 저장소 이름 'deploy'
    await store.setJSON(shortCode, { originalUrl });

    return {
      statusCode: 200,
      body: JSON.stringify({ shortCode }),
    };
  } catch (error) {
    console.error("Shorten function error:", error); // Netlify 로그에 에러 기록
    return {
      statusCode: 500, // 서버 내부 오류 상태 코드
      body: JSON.stringify({ message: 'URL 단축 중 서버 오류가 발생했습니다.' }) // 좀 더 구체적인 에러 메시지 반환
    };
  }
};
