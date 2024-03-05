// * IMPORTS * //
const router = require('express').Router()
const {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
} = require('../controllers/auth.controller')

// * ROUTES * //
// LOGIN
router.post('/login', loginUser)

// Register
router.post('/register', registerUser)

// Verify Email
router.post('/verify-email', verifyEmail)

// Logout
router.delete('/logout', logoutUser)

// * EXPORTS * //
module.exports = router
