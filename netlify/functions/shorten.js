const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'POST only' };
  }

  const { originalUrl } = JSON.parse(event.body);
  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  const shortCode = Math.random().toString(36).substring(2, 8);

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/urls`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      shortcode: shortCode,
      original_url: originalUrl
    })
  });

  if (!res.ok) {
    return { statusCode: 500, body: 'Supabase insert failed' };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ shortCode })
  };
};
