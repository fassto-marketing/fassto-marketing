import { getDeployStore } from '@netlify/blobs';

export default async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'POST 방식만 허용됩니다.' };
  }

  const { originalUrl } = JSON.parse(event.body || '{}');

  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
    return { statusCode: 400, body: '올바른 URL을 입력해주세요.' };
  }

  const shortCode = Math.random().toString(36).substring(2, 8);
  const store = getDeployStore('urls');  // 🔥 여기!
  await store.setJSON(shortCode, { originalUrl });

  return {
    statusCode: 200,
    body: JSON.stringify({ shortCode }),
  };
}
