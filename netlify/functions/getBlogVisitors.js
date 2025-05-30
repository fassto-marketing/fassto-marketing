import fetch from 'node-fetch';

export async function handler(event) {
  const { blogId } = event.queryStringParameters;

  if (!blogId) {
    return { statusCode: 400, body: 'Missing blogId' };
  }

  const url = `https://blog.naver.com/NVisitorgp4Ajax.nhn?blogId=${blogId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch visitor data.' }),
    };
  }
}
