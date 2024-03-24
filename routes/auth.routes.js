// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
} = require('../controllers/auth.controller')

// * ROUTES * //
// LOGIN
router.post('/login', loginUser)

// Register
router.post('/register', registerUser)

// Verify Email
router.post('/verify-email', verifyEmail)

// Logout
router.delete('/logout', authenticateUser, logoutUser)

// Forgot Password
router.post('/forgot-password', forgotPassword)

// Reset Password
router.post('/reset-password', resetPassword)

// get the current users profile
router.get('/user-profile', authenticateUser, getUserProfile)
// * EXPORTS * //
module.exports = router
