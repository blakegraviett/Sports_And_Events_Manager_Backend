// * IMPORTS * //
const User = require('../models/user.model')
const Token = require('../models/token.model')
const jwt = require('jsonwebtoken')
const Org = require('../models/org.model')
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
  const { name, email, password, org } = req.body

  // if no email or password, return error
  if (!email || !password) {
    return unsuccessfulRes({ res })
  }

  // check if user already exists
  if (await User.findOne({ email })) {
    return unsuccessfulRes({ res, status: 400, msg: 'User already exists' })
  }

  // Find organization by name
  const foundOrg = await Org.findOne({ name: org })

  // check if there is an organization
  if (!foundOrg) {
    return unsuccessfulRes({
      res,
      status: 400,
      msg: 'Not a valid organization',
    })
  }
  // create verification token
  const verificationToken = crypto.randomBytes(40).toString('hex')

  // create new user
  const newUser = await User.create({
    name,
    email,
    password,
    org: foundOrg._id,
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
  const isMatch = await user.comparePassword(password)

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

  // construct token
  const tokenUser = {
    name: user.name,
    email: user.email,
    userId: user._id,
    role: user.role,
    org: user.org,
  }

  // create refresh token
  let refreshToken = ''

  // check for exsisiting token
  const exsisitingToken = await Token.findOne({ user: user._id })

  if (exsisitingToken) {
    const { isValid } = exsisitingToken
    if (!isValid) {
      return unauthorizedRes({ res })
    }
    // If token exsist replace it
    refreshToken = exsisitingToken.refreshToken

    // attach cookies to response
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })

    // return successful res
    successfulRes({
      res,
      data: {
        name: user.name,
        email: user.email,
        userId: user._id,
        role: user.role,
      },
    })
    return
  }

  // Construct token
  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip

  const userToken = {
    refreshToken,
    userAgent,
    ip,
    user: user._id,
  }

  await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })

  successfulRes({ res, data: { user: tokenUser } })
}

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  // Extract email from request
  const { email } = req.body

  // Check for email
  if (!email) {
    return res.status(400).json({ msg: 'Please provide email' })
  }

  // Find User
  const user = await User.findOne({ email })

  if (user) {
    // Create password token
    const passwordToken = crypto.randomBytes(70).toString('hex')

    // Send email
    await sendResetPassswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin: 'http://localhost:4200',
    })

    // Ten Minutes
    const tenMinutes = 1000 * 60 * 10
    // Password Token Expire Date
    const passwordTokenExpireDate = new Date(Date.now() + tenMinutes)

    user.passwordToken = passwordToken
    user.passwordTokenExpireDate = passwordTokenExpireDate
    await user.save()

    // send sucess message
    res.status(200).json({ msg: 'Password Reset Email Sent' })
  }
}

// Reset Password
const resetPassword = async (req, res) => {
  // Extract email, token, and password from request
  const { email, token, password } = req.body

  // Check for email, token, and password
  if (!token || !email || !password) {
    return res.status(400).json({ msg: 'Please Provide All Values' })
  }

  // Find User
  const user = await User.findOne({ email })

  if (user) {
    // Current Date
    const currentDate = Date.now()
    if (
      user.passwordToken === token &&
      user.passwordTokenExpireDate > currentDate
    ) {
      user.password = password
      user.passwordToken = null
      user.passwordTokenExpireDate = null
      await user.save()
    }
  }

  res.status(200).json({ msg: 'Password Reset' })
}

// Logout User
const logoutUser = async (req, res) => {
  // get the user and delete the token
  await Token.findOneAndDelete({ user: req.user.userId })

  // clear cookies
  res.cookie('accessToken', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: 'none',
  })

  res.cookie('refreshToken', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: 'none',
  })

  return successfulRes({ res })
}

// * EXPORTS * //
module.exports = {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
  forgotPassword,
  resetPassword,
}
