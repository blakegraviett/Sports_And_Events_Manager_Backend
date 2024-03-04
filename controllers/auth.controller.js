// * IMPORTS * //
const User = require('../models/user.model')
const Token = require('../models/token.model')
const crypto = require('crypto')
const { attachCookiesToResponse } = require('../lib/cookie')
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
const loginUser = async (req, res) => {
  // get data from request body
  const { email, password } = req.body

  // if no email or password, return error
  if (!email || !password) {
    return unsuccessfulRes({ res })
  }

  // find user by email
  const user = await User.findOne({ email })

  // if user not found, return error
  if (!user) {
    return unauthorizedRes({ res })
  }

  // check if password is correct
  const isMatch = user.comparePassword(password)

  // if password is not correct, return error
  if (!isMatch) {
    return unauthorizedRes({ res })
  }

  // check if user is verified
  if (!user.isVerified) {
    return unsuccessfulRes({
      res,
      status: 400,
      msg: 'Please verify your email',
    })
  }

  // create token
  const tokenUser = { name: user.name, userId: user._id, role: user.role }

  // create refresh token
  let refreshToken = ''

  // check for exsisiting token
  const exsisitingToken = await Token.findOne({ user: user._id })

  if (exsisitingToken) {
    const { isValid } = exsisitingToken
    if (isValid) {
      return unauthorizedRes({ res })
    }
    // If token exsist replace it
    refreshToken = exsisitingToken.refreshToken
  }

  // attach cookies to response
  attachCookiesToResponse({ res, user: tokenUser, refreshToken })

  // return successful res
  successfulRes({ res, data: user })
  return
}

// Logout User
const logoutUser = async (req, res) => {}

// * EXPORTS * //
module.exports = {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
}
