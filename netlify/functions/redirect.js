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

  // ✅ 원본 URL 조회
  const { data, error } = await supabase
    .from('urls')
    .select('original_url')
    .eq('shortcode', code)
    .single();

  if (error || !data) {
    console.error("❌ Supabase SELECT 에러:", error);
    return {
      statusCode: 404,
      body: '유효하지 않은 단축 URL입니다.',
    };
  }

  const originalUrl = data.original_url;

  // ✅ 클릭 기록 (비동기 처리 + 오류 체크)
  const { error: logError } = await supabase.from('clicks').insert([
    {
      shortcode: code,
      timestamp: new Date().toISOString(),
      user_agent: event.headers['user-agent'] || 'unknown',
      ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
    }
  ]);
  
  if (logError) {
    console.error("🔴 클릭 기록 실패:", logError);
  } else {
    console.log("🟢 클릭 기록 성공");
  }

  // ✅ 리디렉션 처리
  console.log("✅ 리디렉션 URL:", data.original_url);
  return {
    statusCode: 302,
    headers: {
      Location: data.original_url,
    },
  };
};
