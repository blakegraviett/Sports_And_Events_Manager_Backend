// * IMPORTS * //
const router = require('express').Router()
const {
  authenticateUser,
  authenticateAdmin,
} = require('../middleware/auth.middleware')
const {
  getAllEvents,
  getSingleEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller')

// * ROUTES * //
// Get all events based on organization
router.get('/', authenticateUser, getAllEvents)

// Get Single event based on organization
router.get('/:id', authenticateUser, getSingleEvent)

// Creat event for an organization by admin
router.post('/', authenticateAdmin, createEvent)

// Update event for an organization by admin
router.patch('/:id', authenticateAdmin, updateEvent)

// Delete event for an organization by admin
router.delete('/:id', authenticateAdmin, deleteEvent)

// * EXPORTS * //
module.exports = router
