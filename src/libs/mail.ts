import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as pug from 'pug';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInviteCompanyMail = async (
  to: string,
  subject: string,

  companyName: string,
  email: string,
  membershipName: string,

  startDate: string,
  endDate: string,

  acceptUrl: string
) => {
  const html = pug.renderFile(join(__dirname, '../pug/invite-company.pug'), {
    companyName,
    email,
    membershipName,
    startDate,
    endDate,
    acceptUrl,
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
