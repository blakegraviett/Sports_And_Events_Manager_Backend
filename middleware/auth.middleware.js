// * IMPORTS * //
const jwt = require('jsonwebtoken')
const Token = require('../models/token.model')
const attachCookiesToResponse = require('../lib/cookie')
const { unauthorizedRes, unsuccessfulRes } = require('../lib/response')

//  Middleware function for authenticating the user role
const authenticateUser = async (req, res, next) => {
  // Get the data from the cookies
  const { accessToken, refreshToken } = req.signedCookies

  try {
    // Check if there is an access token
    if (accessToken) {
      // get the information from the token
      const { payload } = jwt.verify(accessToken, process.env.JWT_SECRET)

      // put it in the req.user object
      req.user = payload.user

      // use the next middleware function
      return next()
    }

    if (!refreshToken) {
      return unauthorizedRes({ res })
    }

    // f there is no access token then verify the refresh token
    const { payload } = jwt.verify(refreshToken, process.env.JWT_SECRET)

    // Find the exsiting token
    const exsisitingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    })

    if (!exsisitingToken || !exsisitingToken.isValid) {
      return unauthorizedRes({ res })
    }

    // attach cookies to response with the user information
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: exsisitingToken.refreshToken,
    })

    // continue with the next middleware function
    next()
  } catch (error) {
    return unsuccessfulRes({ res, data: error })
  }
}

// Middleware function for authenticating the admin role
const authenticateAdmin = async (req, res, next) => {
  // Get the data from the cookies
  const { accessToken, refreshToken } = req.signedCookies

  try {
    // Check if there is an access token
    if (accessToken) {
      // get the information from the token
      const { payload } = jwt.verify(accessToken, process.env.JWT_SECRET)

      // put it in the req.user object
      req.user = payload.user

      // check to see if the user is an admin
      if (req.user.role !== 'admin') {
        return unauthorizedRes({ res })
      }

      // use the next middleware function
      return next()
    }

    if (!refreshToken) {
      return unauthorizedRes({ res })
    }

    // f there is no access token then verify the refresh token
    const { payload } = jwt.verify(refreshToken, process.env.JWT_SECRET)

    // Find the exsiting token
    const exsisitingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    })

    if (!exsisitingToken || !exsisitingToken.isValid) {
      return unauthorizedRes({ res })
    }

    // attach cookies to response with the user information
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: exsisitingToken.refreshToken,
    })

    // continue with the next middleware function
    next()
  } catch (error) {
    return unsuccessfulRes({ res, data: error })
  }
}

// * EXPORTS * //
module.exports = {
  authenticateUser,
  authenticateAdmin,
}
