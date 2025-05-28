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

  const { subject, body, recipients } = JSON.parse(event.body);
  const emails = recipients.split(',').map(email => email.trim());

  const messages = emails.map(email => ({
    to: email,
    from: 'hello@fassto.com', 
    subject: subject,
    html: body,
  }));

  try {
    await sgMail.send(messages);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ success: true })
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
