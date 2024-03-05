// * IMPORTS * //
const { mongoose, Types } = require('mongoose')
const Schema = mongoose.Schema

// * MODEL * //
const tokenModel = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// * EXPORTS * //
module.exports = mongoose.model('Token', tokenModel)
