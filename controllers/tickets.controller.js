// * IMPORTS * //
const { successfulRes, unsuccessfulRes } = require('../lib/response')
const { sendEmail } = require('../lib/email')
const qr = require('qrcode')
const crypto = require('crypto')
const Ticket = require('../models/ticket.model')
const nodemailer = require('nodemailer')

// * CONTROLLERS * //
// send ticket purchase emails
const purchaseTickets = async (req, res) => {
  const event = req.body
  switch (event.type) {
    case 'payment_intent.succeeded':
      {
        // ! SEND EMAIL ONLY IF PAYMENT IS SUCCESSFUL
        // make a id for the ticket
        const ticketId = crypto.randomBytes(60).toString('hex')

        // qr code link
        const origin = `https://www.sportalmanager.com/tickets/${ticketId}`

        //.createRequestcode
        const qr_png = qr.imageSync(origin, { type: 'png' })

        const transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        })

        // create the ticket
        await Ticket.create({
          ticketId,
        })

        // send email to the user
        await transporter.sendMail({
          from: 'sportalmanager@gmail.com',
          to: event['data']['object']['receipt_email'],
          subject: 'Ticket Purchase 5',
          html: `Hi,<br><br>You have successfully purchased a ticket.<br><br>Thank you for your purchase.<br><br>Regards,<br><br>Team Sportal.<br><br>`,
          attachments: [
            {
              filename: 'ticket_qr_code.png',
              content: qr_png,
              encoding: 'base64',
            },
          ],
        })
      }
      return res.status(400).end()
  }
}

// check tickets
const checkTickets = async (req, res) => {
  // get the ticketId from the request params
  const ticketId = req.params.id

  // find the ticket
  const ticket = await Ticket.findOne({ ticketId })

  // if no ticket, return error
  if (!ticket) {
    return unsuccessfulRes({ res, status: 404, msg: 'Ticket not found' })
  }

  // if the ticket has already been used, return error
  if (ticket.isUsed) {
    return unsuccessfulRes({
      res,
      status: 400,
      msg: 'Ticket has already been used',
    })
  }

  // mark the ticket as used
  ticket.isUsed = true
  ticket.save()

  // delete the ticket
  await Ticket.deleteOne({ ticketId })

  // return successful res
  return successfulRes({ res, data: { msg: 'Ticket Successfull' } })
}

// * EXPORTS * //
module.exports = {
  purchaseTickets,
  checkTickets,
}
