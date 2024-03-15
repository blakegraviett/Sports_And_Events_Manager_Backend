// * IMPORTS * //
const { mongoose, Types } = require('mongoose')
const Schema = mongoose.Schema

// * MODEL * //
const eventModel = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  description: {
    type: String,
    maxLength: 1000,
  },
  sport: {
    type: String,
    enum: ['basketball', 'baseball', 'football', 'volleyball', 'other'],
    required: true,
  },
  period: [
    {
      type: String,
    },
  ],
  teams: [
    {
      type: Types.ObjectId,
      ref: 'Team',
    },
  ],
  ticketLink: {
    type: String,
  },
  paymentLinkID: {
    type: String,
  },
  location: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  date: {
    type: Date,
    // ! CHANGE BACK AFTER DEVELOPMENT
    // required: true,
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  org: {
    type: Types.ObjectId,
    ref: 'Org',
    required: true,
  },
  workers: [
    {
      type: Types.ObjectId,
      ref: 'User',
    },
  ],
  links: [
    {
      type: String,
    },
  ],
})

// * EXPORTS * //
module.exports = mongoose.model('Event', eventModel)
