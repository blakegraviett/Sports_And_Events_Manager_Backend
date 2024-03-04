// * IMPORTS * //
const User = require('../models/user.model')
const crypto = require('crypto')
const {
  successfulRes,
  unsuccessfulRes,
  unauthorizedRes,
} = require('../lib/response')
const { sendVerificationEmail } = require('../lib/email')

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

  // ! ONLY FOR TESTING PURPOSES! CHANGE TO PRODUCTION LATER!
  const origin = 'http://localhost:4200'

  // send verification email
  await sendVerificationEmail({
    name: newUser.name,
    email: newUser.email,
    verificationToken: newUser.verificationToken,
    origin: origin,
  })

  successfulRes({ res, data: newUser })
}

// Verify User Email
const verifyEmail = async (req, res) => {
  // get data from request body
  const { token, email } = req.query

  // if no token or email, return error
  if (!token || !email) {
    return unsuccessfulRes({ res })
  }

  // find user by email
  const user = await User.findOne({ email })

  // if user not found, return error
  if (!user) {
    return unsuccessfulRes({ res, status: 400, msg: 'User not found' })
  }

  // check if token is valid
  if (user.verificationToken !== token) {
    return unsuccessfulRes({ res, status: 400, msg: 'Invalid token' })
  }

  // update user
  user.isVerified = true
  user.verificationToken = null
  user.save()

  return successfulRes({ res, data: user })
}

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
