// * IMPORTS * //
const { successfulRes, unsuccessfulRes } = require('../lib/response')
const { sendEmail } = require('../lib/email')
const qr = require('qrcode')
const crypto = require('crypto')
const Ticket = require('../models/ticket.model')

// * CONTROLLERS * //
// send ticket purchase emails
const purchaseTickets = async (req, res) => {
  const event = req.body
  switch (event.type) {
    case 'payment_intent.succeeded': {
      // ! SEND EMAIL ONLY IF PAYMENT IS SUCCESSFUL
      // make a id for the ticket
      const ticketId = crypto.randomBytes(60).toString('hex')

      // qr code link
      const origin = `https://www.sportalmanager.com/tickets/${ticketId}`

      //.createRequestcode
      const qrCode = await qr.toString(origin, {
        errorCorrectionLevel: 'H',
        type: 'String',
      })

      // create the ticket
      await Ticket.create({
        ticketId,
      })

      // send email to the user
      await sendEmail({
        from: 'sportalmanager@gmail.com',
        to: event['data']['object']['receipt_email'],
        subject: 'Ticket Purchase 1',
        html: `Hi,<br><br>You have successfully purchased a ticket.<br><br>Thank you for your purchase.<br><br>Regards,<br><br>Team Sportal.<br><br> <p style="width:250px">${qrCode}</p>`,
      })
    }
    default:
      // Unexpected event type
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
