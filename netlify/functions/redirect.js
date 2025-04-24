exports.handler = async (event) => {
  const { code } = event.queryStringParameters;

  // 예시: code에 해당하는 원래 URL을 조회
  const originalUrl = await getOriginalUrl(code);

  if (!originalUrl) {
    return {
      statusCode: 404,
      body: 'Not Found',
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: originalUrl,
    },
  };
};
