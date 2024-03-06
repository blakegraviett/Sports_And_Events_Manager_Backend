// * IMPORTS * //
const { mongoose, Types } = require('mongoose')
const Schema = mongoose.Schema

// * MODEL * //
const teamModel = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  logo: {
    type: String,
    required: true,
  },
  org: {
    type: Types.ObjectId,
    ref: 'Org',
    required: true,
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

// * EXPORTS * //
module.exports = mongoose.model('Team', teamModel)
