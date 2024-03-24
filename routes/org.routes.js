// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const { getAllOrgs, getSingleOrg } = require('../controllers/org.controller')

// * ROUTES * //
// get all orgs
router.get('/', getAllOrgs)

// get single org by id
router.get('/:id', getSingleOrg)

// * EXPORTS * //
module.exports = router
