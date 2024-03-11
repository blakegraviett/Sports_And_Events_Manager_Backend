// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const {
  getAllUsersByOrg,
  getSingleUser,
  updateUserAdmin,
  demoteUserAdmin,
} = require('../controllers/user.controller')

// * ROUTES * //
// get all orgs
router.get('/', authenticateAdmin, getAllUsersByOrg)

// get single org by id
router.get('/:id', authenticateAdmin, getSingleUser)

// Make a user an admin
router.patch('/update-admin/:id', authenticateAdmin, updateUserAdmin)

// Demote a user to a standard user
router.patch('/demote-admin/:id', authenticateAdmin, demoteUserAdmin)

// * EXPORTS * //
module.exports = router
