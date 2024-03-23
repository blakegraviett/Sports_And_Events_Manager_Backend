// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const {
  getAllTeams,
  getSingleTeam,
  createTeam,
  updateTeam,
  deleteSingleTeam,
  uploadSingleImageToCloudinary,
} = require('../controllers/team.controller')
const app = express()
// * ROUTES * //
// get all teams based on organization
router.get('/', authenticateUser, getAllTeams)

// get single team based on organization by id
router.get('/:id', authenticateUser, getSingleTeam)

// create new team based on organization
router.post('/', authenticateAdmin, createTeam)

// update team based on organization
router.patch('/:id', authenticateAdmin, updateTeam)

// delete team based on organization
router.delete('/:id', authenticateAdmin, deleteSingleTeam)

router.post(
  '/upload-image',
  authenticateAdmin,
  app.use(
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      next()
    })
  ),
  uploadSingleImageToCloudinary
)

// * EXPORTS * //
module.exports = router
