const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
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
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
