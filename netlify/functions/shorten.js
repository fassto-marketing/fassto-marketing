const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'POST 방식만 허용됩니다.' };
  }

  try {
    const { originalUrl } = JSON.parse(event.body);
    if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
      return { statusCode: 400, body: '올바른 URL을 입력해주세요.' };
    }

    const shortcode = Math.random().toString(36).substring(2, 8);

    const { error } = await supabase.from('urls').insert([
      {
        shortcode,
        original_url: originalUrl
      }
    ],
    { returning: 'minimal' } // ✅ 핵심 수정
  );

    if (error) {
      console.error('Supabase 오류:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Supabase 삽입 실패' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ shortCode: shortcode })
    };
  } catch (err) {
    console.error('단축 실패 오류:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '서버 오류' })
    };
  }
};
