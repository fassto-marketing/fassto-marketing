const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  // 🔸 사전 요청 (CORS용)
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

  try {
    const { subject, html, recipients, attachments } = JSON.parse(event.body);

    // recipients는 배열 또는 문자열일 수 있음 → 처리
    const emails = Array.isArray(recipients)
      ? recipients
      : recipients
          .split(/[\n,]+/)
          .map(email => email.trim())
          .filter(email => email);

    // attachments가 없을 경우 대비
    const parsedAttachments = Array.isArray(attachments)
      ? attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.type,
          disposition: "inline",
          content_id: att.cid
        }))
      : [];

    // 각 수신자에게 동일한 메시지 전송
    const messages = emails.map(email => ({
      to: email,
      from: 'hello@fassto.com', 
      subject,
      html,
      attachments: parsedAttachments
    }));

    await sgMail.send(messages, true); // true = 병렬 처리 (multiple)

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, successCount: emails.length }),
    };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
