const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event) {
  const code = event.queryStringParameters.code;

  const { data, error } = await supabase
    .from('urls')
    .select('original_url')
    .eq('shortcode', code)
    .single();

  if (error || !data) {
    return {
      statusCode: 404,
      body: '유효하지 않은 단축 URL입니다.',
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: data.original_url,
    },
  };
};
