// * IMPORTS * //
const router = require('express').Router()
const {
  purchaseTickets,
  checkTickets,
} = require('../controllers/tickets.controller')

// * ROUTES * //
// send ticket purchase emails
router.post('/purchase', purchaseTickets)

router.get('/check/:id', checkTickets)

// * EXPORTS * //
module.exports = router
