const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  // 🔸 브라우저에서 사전 요청 (OPTIONS method) 처리
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const { subject, html, recipients } = JSON.parse(event.body);
  const emails = Array.isArray(recipients)
    ? recipients
    : recipients
      .split(/[\n,]+/)              // 쉼표 또는 줄바꿈(\n) 기준으로 나누고
      .map(email => email.trim())   // 앞뒤 공백 제거
      .filter(email => email);      // 빈 값 제거
  const messages = emails.map(email => ({
    to: email,
    from: 'hello@fassto.com', 
    subject: subject,
    html: html,
  }));

  try {
    await sgMail.send(messages);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true, successCount: emails.length })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
