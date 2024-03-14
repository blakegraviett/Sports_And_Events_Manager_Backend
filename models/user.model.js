// * IMPORTS * //
const { mongoose, Types } = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// * USER MODEL * //
const userModel = new Schema({
  name: {
    type: String,
    required: true,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email "address',
    ],
    unique: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'owner'],
    default: 'user',
  },
  org: {
    type: Types.ObjectId,
    ref: 'Org',
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verifiedAt: Date,
  passwordToken: String,
  passwordTokenExpireDate: Date,
})

// * METHODS * //
// hash and salt the password
userModel.pre('save', async function () {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return

  // generate a salt
  const salt = await bcrypt.genSalt(10)

  // hash the password using our new salt
  this.password = await bcrypt.hash(this.password, salt)
})

// compare the incoming password with the hashed password
userModel.methods.comparePassword = async function (incommingPassword) {
  const isMatch = await bcrypt.compare(incommingPassword, this.password)
  return isMatch
}

// Generate a JWT token
userModel.methods.createToken = async function () {
  const token = jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
  return token
}

// * EXPORTS * //
module.exports = mongoose.model('User', userModel)
