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
  isSport: {
    type: Boolean,
    required: true,
    default: false,
  },
  teams: [
    {
      type: Types.ObjectId,
      ref: 'Team',
    },
  ],
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
})

// * EXPORTS * //
module.exports = mongoose.model('Event', eventModel)
