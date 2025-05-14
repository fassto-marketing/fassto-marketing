const { createClient } = require('@supabase/supabase-js');

// 🔽 환경변수 확인용 로그
console.log("✅ SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("✅ SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY?.substring(0, 10) + "...");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async function (event) {
  const path = event.path; // 예: "/.netlify/functions/redirect/bxmz0t"
  const segments = path.split('/');
  const code = segments[segments.length - 1];
  console.log("➡️ 요청된 shortcode:", code);

  const { data, error } = await supabase
    .from('urls')
    .select('original_url')
    .eq('shortcode', code)
    .single();

  if (error) {
    console.error("❌ Supabase SELECT 에러:", error);
  }

  if (!data) {
    console.log("❗ Supabase에서 데이터를 찾지 못했습니다.");
    return {
      statusCode: 404,
      body: '유효하지 않은 단축 URL입니다.',
    };
  }

  console.log("✅ 리디렉션 URL:", data.original_url);

  return {
    statusCode: 302,
    headers: {
      Location: data.original_url,
    },
  };
};
