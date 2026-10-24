import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // or use "smtp" for custom providers
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // app password (not your Gmail login!)
  },
});

export const sendOTP = async (to, otp) => {
  const mailOptions = {
   from: `"Mining Shiksha" <helpminingshiksha@gmail.com>`,
    to,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
