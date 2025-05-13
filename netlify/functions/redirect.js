const fetch = require('node-fetch');

exports.handler = async function(event) {
  const code = event.queryStringParameters.code;

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/urls?shortcode=eq.${code}`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    }
  });

  const data = await res.json();

  if (!data || data.length === 0) {
    return {
      statusCode: 404,
      body: '단축 URL을 찾을 수 없습니다.'
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: data[0].original_url
    }
  };
};
