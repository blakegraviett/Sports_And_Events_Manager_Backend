// * IMPORTS * //
const jwt = require('jsonwebtoken')

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  // Create Access Token
  const accessTokenJWT = jwt.sign({ payload: { user } }, process.env.JWT_SECRET)

  // Create Refresh Token
  const refreshTokenJWT = jwt.sign(
    { payload: { user, refreshToken } },
    process.env.JWT_SECRET
  )

  // 1 Day
  // const oneDay = 1000 * 60 * 60 * 24
  const oneDay = 1000
  // 30 Days
  const longerExp = 1000 * 60 * 60 * 24 * 30

  // Attach accessToken to response using the one day expiration
  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS!! if we are in production
    signed: true,
    expires: new Date(Date.now() + oneDay),
  })

  // Attach refreshToken to response using the 30 day expiration
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  })
}

// * EXPORTS * //
module.exports = {
  attachCookiesToResponse,
}
