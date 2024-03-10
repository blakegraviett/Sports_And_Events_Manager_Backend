// * IMPORTS * //
const { mongoose, Types } = require('mongoose')
const Schema = mongoose.Schema

// * MODEL * //
const ticketModel = new Schema({
  ticketId: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
})

// * EXPORTS * //
module.exports = mongoose.model('Ticket', ticketModel)
