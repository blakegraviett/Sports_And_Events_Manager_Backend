// * IMPORTS * //
const Event = require('../models/event.model')
const User = require('../models/user.model')
const Team = require('../models/team.model')
const Org = require('../models/org.model')
const { successfulRes, unsuccessfulRes } = require('../lib/response')
const { sendEmail } = require('../lib/email')
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const qr = require('qrcode')
const crypto = require('crypto')
const Ticket = require('../models/ticket.model')

// * CONTROLLERS * //
// Get all events based on organization
const getAllEvents = async (req, res) => {
  // Get the organization
  const { org } = req.user

  // Get all events by organization
  const events = await Event.find({ org })

  // if no events, return
  if (!events) {
    return unsuccessfulRes({ res, status: 404, msg: 'Events not found' })
  }

  // send back all events
  successfulRes({ res, data: events })
}

// Get Single event based on organization
const getSingleEvent = async (req, res) => {
  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // Get the event
  const event = await Event.findOne({ _id: id })

  // if no event, return error
  if (!event) {
    return unsuccessfulRes({ res, status: 404, msg: 'Event not found' })
  }

  // send back the event
  successfulRes({ res, data: event })
}

// Creat event for an organization by admin
const createEvent = async (req, res) => {
  // Get the information from the request body
  const {
    name,
    location,
    date,
    description,
    awayTeam,
    homeTeam,
    workerEmails,
    sport,
    link,
    price: itemPrice,
    ticketAmount,
  } = req.body

  // Get the workers from there email address
  const workers = await User.find({ email: workerEmails })

  // find the teams by name
  const foundHomeTeam = await Team.find({ name: homeTeam })

  const foundAwayTeam = await Team.find({ name: awayTeam })

  // Get the organization and the author from the user
  const { org, userId } = req.user

  // find the organization
  const foundOrg = await Org.findOne({ _id: org })

  // defaults
  let paymentLink = ''
  let paymentLinkID = ''

  if (itemPrice) {
    const product = await stripe.products.create({
      name: 'Tickets for ' + name,
      description: description,
      images: [foundOrg.logo],
    })

    // ! CREATE STRIPE PAYMENT LINK
    // Create a new price point for our secret image product
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: itemPrice * 100,
      product: product.id,
    })

    // Create a new payment session with that price id
    paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      restrictions: {
        completed_sessions: {
          limit: ticketAmount,
        },
      },
    })

    paymentLinkID = paymentLink.id
  }

  // Create the event
  const newEvent = await Event.create({
    name,
    location,
    date,
    sport,
    description,
    teams: {
      homeTeam: foundHomeTeam[0]._id,
      awayTeam: foundAwayTeam[0]._id,
    },
    workers,
    org,
    link,
    paymentLinkID: paymentLink.id,
    author: userId,
    ticketLink: paymentLink.url,
  })

  // send back the created event
  return successfulRes({ res, data: newEvent })
}

// Update event for an organization by admin
const updateEvent = async (req, res) => {
  // Get the information from the request body
  const { name, location, date, description, awayTeam, homeTeam, link } =
    req.body
  let { workers } = req.body

  // Get the workers from there email address and convert them to Ids
  if (workers) {
    const workersIds = []
    for (const worker of workers) {
      const singleWorker = await User.find({ email: worker })
      workersIds.push(singleWorker[0]._id)
    }
    workers = workersIds
  }

  // find the teams by name
  let foundHomeTeam = await Team.find({ name: homeTeam })
  let foundAwayTeam = await Team.find({ name: awayTeam })

  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // if no team then return old team
  if (!awayTeam) {
    const foundEvent = await Event.findOne({ _id: id })
    foundAwayTeam[0] = { _id: foundEvent.teams.awayTeam }
  }
  if (!homeTeam) {
    const foundEvent = await Event.findOne({ _id: id })
    foundHomeTeam[0] = { _id: foundEvent.teams.homeTeam }
  }

  // update the event with the information from the request body
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: id },
    {
      name,
      location,
      date,
      description,
      teams: {
        homeTeam: foundHomeTeam[0]._id,
        awayTeam: foundAwayTeam[0]._id,
      },
      workers,
      link,
    },
    { new: true }
  )

  // send back the updated event
  return successfulRes({ res, data: updatedEvent })
}

// Update score of a sport by admin
const updateScore = async (req, res) => {
  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // Get the information from the request body
  const { homeTeamScore, awayTeamScore } = req.body

  // if no score, return error
  if (!homeTeamScore || !awayTeamScore) {
    return unsuccessfulRes({ res })
  }

  // Get the event
  const foundEvent = await Event.findOne({ _id: id })

  // if no event, return error
  if (!foundEvent) {
    return unsuccessfulRes({ res, status: 404, msg: 'Event not found' })
  }

  // get the sport from the event
  const sport = foundEvent.sport

  // type of period default
  let period = ''

  if (sport === 'baseball') {
    period = 'Innging'
  }
  if (sport === 'football' || sport === 'basketball') {
    period = 'Quarter'
  }
  if (sport === 'volleyball') {
    period = 'Game'
  }

  // defauly peiord ammount
  let periodAmount = 0

  // if there already are periods set the amount equal to that
  if (foundEvent.period.length) {
    periodAmount = foundEvent.period.length
  }

  // Find the tems in the event
  const homeTeam = await Team.find({ _id: foundEvent.teams.homeTeam._id })
  const awayTeam = await Team.find({ _id: foundEvent.teams.awayTeam._id })

  // add the new period to the event
  foundEvent.period.push(
    `${period} ${periodAmount + 1} : ${homeTeam[0].name}: ${homeTeamScore} - ${
      awayTeam[0].name
    }: ${awayTeamScore}`
  )

  // save the update to the database
  await foundEvent.save()

  // return the updated score
  return successfulRes({ res, data: foundEvent })
}

// Delete event for an organization by admin
const deleteEvent = async (req, res) => {
  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  //find the event
  const foundEvent = await Event.findOne({ _id: id })

  // if no event, return error
  if (!foundEvent) {
    return unsuccessfulRes({ res, status: 404, msg: 'Event not found' })
  }

  // deactivate the events payment link if there is one
  if (foundEvent.paymentLinkID) {
    await stripe.paymentLinks.update(foundEvent.paymentLinkID, {
      active: false,
    })
  }

  // Delete the event
  const deletedEvent = await Event.findOneAndDelete({ _id: id })

  // send back the deleted event
  return successfulRes({ res, data: { message: 'Event deleted successfully' } })
}

// send emails to the workers of an event
const sendEmailToWorkers = async (req, res) => {
  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // Get info from the request body
  const { subject, body, isIndividual } = req.body

  // if no to or subject or body, return error
  if (!subject || !body) {
    return unsuccessfulRes({ res })
  }

  // Get the event
  const event = await Event.findOne({ _id: id })

  // if no event, return error
  if (!event) {
    return unsuccessfulRes({ res, status: 404, msg: 'Event not found' })
  }

  // find all the workers of the event
  // ? $in is used to get all the ids of the users in the events, workers array
  const workers = await User.find({ _id: { $in: event.workers } })

  // get all the workers emails
  const workersEmails = workers.map((worker) => worker.email)

  // get the email of the admin user
  const { email } = req.user

  // send emails to each workers
  if (isIndividual == false) {
    // ! ADD THEM IN THE SAME THREAD
    await sendEmail({
      from: email,
      to: workersEmails,
      subject: subject,
      html: body,
    })
  }

  if (isIndividual == true) {
    // ! SEND INDIVIDUAL EMAILS TO ALL THE WORKERS * //
    for (let i = 0; i < workersEmails.length; i++) {
      console.log('workersEmails[i]:', workersEmails[i])

      await sendEmail({ to: workersEmails[i], subject: subject, html: body })
    }
  }

  // return all the workers
  return successfulRes({ res, data: workersEmails })
}

// send ticket purchase emails
const purchaseTickets = async (req, res) => {
  const event = req.body
  switch (event.type) {
    case 'payment_intent.succeeded': {
      // ! SEND EMAIL ONLY IF PAYMENT IS SUCCESSFUL
      // make a id for the ticket
      const ticketId = crypto.randomBytes(60).toString('hex')

      // qr code link
      const origin = `http://localhost:4200/tickets/${ticketId}`

      //.createRequestcode
      const qrCode = await qr.toString(origin, {
        errorCorrectionLevel: 'H',
        type: 'svg',
      })

      // create the ticket
      await Ticket.create({
        ticketId,
      })

      // send email to the user
      await sendEmail({
        from: 'sportal@sportal.com',
        to: event['data']['object']['receipt_email'],
        subject: 'Ticket Purchase',
        html: `Hi,<br><br>You have successfully purchased a ticket.<br><br>Thank you for your purchase.<br><br>Regards,<br><br>Team Sportal.<br><br> <p style="width:250px">${qrCode}</p>`,
      })
    }
    default:
      // Unexpected event type
      return res.status(400).end()
  }
}

// * EXPORTS * //
module.exports = {
  getAllEvents,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  sendEmailToWorkers,
  purchaseTickets,
  updateScore,
}
