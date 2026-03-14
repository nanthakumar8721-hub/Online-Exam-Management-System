const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Exam System'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

exports.sendCredentials = async (email, password, name) => {
  const message = `Dear ${name || 'User'},\n\nWelcome to the Automated Examination System.\n\nYour credentials are:\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Welcome, ${name || 'User'}</h2>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please login and change your password for security.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'Your Account Credentials',
    message,
    html,
  });
};

exports.sendExamLink = async (email, examName, examLink) => {
  const message = `You have been invited to take the exam: ${examName}.\n\nExam Link: ${examLink}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Exam Invitation</h2>
      <p>You have been invited to take the following exam: <strong>${examName}</strong></p>
      <a href="${examLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Exam</a>
      <p>If the button doesn't work, copy and paste this link: ${examLink}</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: `Exam Invitation: ${examName}`,
    message,
    html,
  });
};

exports.sendPasswordChangeOtp = async (email, name, otp) => {
  const message = `Dear ${name || 'User'},\n\nYour OTP for password change is: ${otp}\nThis OTP is valid for 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Password Change Request</h2>
      <p>Dear ${name || 'User'},</p>
      <p>We received a request to change your password. Please use the following OTP to complete the process:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h1 style="letter-spacing: 5px; color: #007bff; margin: 0;">${otp}</h1>
      </div>
      <p><strong>Note:</strong> This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'OTP for Password Change',
    message,
    html,
  });
};

exports.sendPasswordChangeSuccess = async (email, name) => {
  const message = `Dear ${name || 'User'},\n\nYour password has been changed successfully.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Password Changed Successfully</h2>
      <p>Dear ${name || 'User'},</p>
      <p>Your password has been successfully updated. If you did not make this change, please contact your administrator immediately.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'Password Changed Successfully',
    message,
    html,
  });
};
