// * IMPORTS * //
const nodemailer = require('nodemailer')

// * NODEMAILER CONFIGURATION * //
const nodemailerConfig = {
  host: 'smtp.porkbun.com	',
  port: 587,
  auth: {
    user: 'sportalteam@sportalmanager.com',
    pass: 'sportalmanager',
  },
}

// * EMAIL FUNCTIONS * //

// Send an email
const sendEmail = async ({ from, to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport(nodemailerConfig)

  return transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html, // html body
  })
}

// Send verification email
const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`

  const message = `<b>Please confirm your email by clicking on the following link : <a href="${verifyEmail}">Verify Email</a> </b>`

  return sendEmail({
    from: 'event-manager-auth@test.com',
    to: email,
    subject: 'Verify Email',
    html: `<h4> Hello ${name},</h4>
        ${message}`,
  })
}

// * EXPORTS * //
module.exports = {
  sendVerificationEmail,
  sendEmail,
}
