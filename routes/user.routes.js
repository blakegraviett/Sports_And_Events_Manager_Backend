// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const {
  getAllUsersByOrg,
  getSingleUser,
} = require('../controllers/user.controller')

// * ROUTES * //
// get all orgs
router.get('/', authenticateAdmin, getAllUsersByOrg)

// get single org by id
router.get('/:id', authenticateAdmin, getSingleUser)

// * EXPORTS * //
module.exports = router
