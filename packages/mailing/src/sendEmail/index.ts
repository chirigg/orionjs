import defaultTransporter from './transporter'
import logMail from './logMail'
import {SendMailOptions, SentMessageInfo, Transporter} from 'nodemailer'

const defaultMailOptions = {
  from: process.env.MAIL_FROM || '"Orionjs App" <app@orionjs.com>'
}

export default async function (
  options: SendMailOptions,
  transporter: Transporter<any> = defaultTransporter
): Promise<SentMessageInfo> {
  const mailOptions = {
    ...defaultMailOptions,
    ...options
  }

  if (!process.env.MAIL_URL) {
    logMail(mailOptions)
  } else {
    const result = await transporter.sendMail(mailOptions)
    return result
  }
}
