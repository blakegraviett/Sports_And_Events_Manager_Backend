// * IMPORTS * //
const Event = require('../models/event.model')
const User = require('../models/user.model')
const Team = require('../models/team.model')
const { successfulRes, unsuccessfulRes } = require('../lib/response')
const { sendEmail } = require('../lib/email')

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
  const { name, location, date, description, teamNames, workerEmails } =
    req.body

  // Get the workers from there email address
  const workers = await User.find({ email: workerEmails })

  // find the teams by name
  const teams = await Team.find({ name: teamNames })

  // Get the organization and the author from the user
  const { org, userId } = req.user

  // Create the event
  const newEvent = await Event.create({
    name,
    location,
    date,
    description,
    teams,
    workers,
    org,
    author: userId,
  })

  // send back the created event
  return successfulRes({ res, data: newEvent })
}

// Update event for an organization by admin
const updateEvent = async (req, res) => {
  // Get the information from the request body
  const { name, location, date, description, teamNames, workerEmails } =
    req.body

  // default values
  let workers = workerEmails
  let teams = teamNames

  // Get the workers from there email address
  if (workerEmails) {
    workers = await User.find({ email: workerEmails })
  }
  // find the teams by name
  if (teamNames) {
    teams = await Team.find({ name: teamNames })
  }

  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // update the event with the information from the request body
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: id },
    {
      name,
      location,
      date,
      description,
      teams,
      workers,
    },
    { new: true }
  )

  // send back the updated event
  return successfulRes({ res, data: updatedEvent })
}

// Delete event for an organization by admin
const deleteEvent = async (req, res) => {
  // Get the id from the parameter
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
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
  if (isIndividual == 'false') {
    // ! ADD THEM IN THE SAME THREAD
    await sendEmail({
      from: email,
      to: workersEmails,
      subject: subject,
      html: body,
    })
  }

  if (isIndividual == 'true') {
    // ! SEND INDIVIDUAL EMAILS TO ALL THE WORKERS * //
    for (let i = 0; i < workersEmails.length; i++) {
      console.log('workersEmails[i]:', workersEmails[i])

      await sendEmail({ to: workersEmails[i], subject: subject, html: body })
    }
  }

  // return all the workers
  return successfulRes({ res, data: workersEmails })
}

// * EXPORTS * //
module.exports = {
  getAllEvents,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  sendEmailToWorkers,
}
