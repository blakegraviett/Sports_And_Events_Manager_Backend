// * IMPORTS * //
const { mongoose } = require('mongoose')
const Schema = mongoose.Schema

// * ORGANIZATION MODEL * //
const orgModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
      unique: true,
    },
    logo: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
      match: [/^\d{5}(?:-\d{4})?$/, 'Please fill a valid zip code "number"'],
    },
    website: {
      type: String,
      match: [
        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
        'Please fill a valid URL "address',
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// * EXPORTS * //
module.exports = mongoose.model('Org', orgModel)
