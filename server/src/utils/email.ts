import nodemailer from "nodemailer";

// 이메일 전송 설정
const createTransporter = () => {
  // 프로덕션 환경에서는 실제 SMTP 서버 사용
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 개발 환경에서는 콘솔에 출력 (또는 Ethereal 사용)
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || "test@ethereal.email",
      pass: process.env.ETHEREAL_PASS || "testpassword",
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `LayerX Forum <${process.env.EMAIL_FROM || "noreply@layerx-forum.com"}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // 개발 환경에서 Ethereal 프리뷰 URL 출력
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("이메일 전송에 실패했습니다.");
  }
};

// 이메일 인증 메일 템플릿
export const sendVerificationEmail = async (
  email: string,
  username: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LayerX Forum</h1>
          <p>이메일 인증</p>
        </div>
        <div class="content">
          <h2>안녕하세요, ${username}님!</h2>
          <p>LayerX Forum에 가입해 주셔서 감사합니다.</p>
          <p>아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">이메일 인증하기</a>
          </div>
          <p>또는 다음 링크를 브라우저에 복사하여 붙여넣으세요:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p><strong>이 링크는 24시간 동안 유효합니다.</strong></p>
        </div>
        <div class="footer">
          <p>본 메일은 LayerX Forum에서 자동으로 발송되었습니다.</p>
          <p>© 2024 LayerX Forum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "[LayerX Forum] 이메일 인증을 완료해 주세요",
    html,
  });
};

// 비밀번호 재설정 메일 템플릿
export const sendPasswordResetEmail = async (
  email: string,
  username: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>LayerX Forum</h1>
          <p>비밀번호 재설정</p>
        </div>
        <div class="content">
          <h2>안녕하세요, ${username}님!</h2>
          <p>비밀번호 재설정을 요청하셨습니다.</p>
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정해 주세요.</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">비밀번호 재설정</a>
          </div>
          <p>또는 다음 링크를 브라우저에 복사하여 붙여넣으세요:</p>
          <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ 주의:</strong> 이 링크는 1시간 동안만 유효합니다.<br>
            비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시해 주세요.
          </div>
        </div>
        <div class="footer">
          <p>본 메일은 LayerX Forum에서 자동으로 발송되었습니다.</p>
          <p>© 2024 LayerX Forum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "[LayerX Forum] 비밀번호 재설정 안내",
    html,
  });
};
