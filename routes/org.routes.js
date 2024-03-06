// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const { getAllOrgs, getSingleOrg } = require('../controllers/org.controller')

// * ROUTES * //
// get all orgs
router.get('/', authenticateUser, getAllOrgs)

// get single org by id
router.get('/:id', authenticateUser, getSingleOrg)

// * EXPORTS * //
module.exports = router
