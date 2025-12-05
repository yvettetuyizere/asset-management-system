const nodemailer = require('nodemailer');

// Test Gmail SMTP connection
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'yvettetuyizere@gmail.com',
    pass: 'jgxg vnyb ntjq rfbm', // App password with spaces
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Connection Successful');
  }
});

// Send test email
const mailOptions = {
  from: 'yvettetuyizere@gmail.com',
  to: 'yvettetuyizere@gmail.com', // Send to yourself
  subject: 'Test Email from Node.js',
  html: `
    <h1>Test Email</h1>
    <p>If you received this email, SMTP is working correctly!</p>
    <p>Time: ${new Date()}</p>
  `,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Email Send Error:', error);
    process.exit(1);
  } else {
    console.log('✅ Email Sent Successfully:', info.messageId);
    process.exit(0);
  }
});
