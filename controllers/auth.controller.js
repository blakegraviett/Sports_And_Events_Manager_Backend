// * IMPORTS * //
const User = require('../models/user.model')
const crypto = require('crypto')
const {
  successfulRes,
  unsuccessfulRes,
  unauthorizedRes,
} = require('../lib/response')

// * CONTROLLERS * //
// Register User
const registerUser = async (req, res) => {
  // get data from request body
  const { name, email, password } = req.body

  // if no email or password, return error
  if (!email || !password) {
    return unsuccessfulRes({ res })
  }

  // check if user already exists
  if (await User.findOne({ email })) {
    return unsuccessfulRes({ res, status: 400, msg: 'User already exists' })
  }

  // create verification token
  const verificationToken = crypto.randomBytes(40).toString('hex')

  // create new user
  const newUser = await User.create({
    name,
    email,
    password,
    verificationToken,
  })

  successfulRes({ res, data: newUser })
}

// Verify User Email
const verifyEmail = async (req, res) => {}

// Login User
const loginUser = async (req, res) => {}

// Logout User
const logoutUser = async (req, res) => {}

// * EXPORTS * //
module.exports = {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
}
