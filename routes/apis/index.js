const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const { authenticated, adminAuthenticated } = require('../../middleware/apiAuth')
const { apiErrorHandler } = require('../../middleware/error-handler')

router.use('/admin', authenticated, adminAuthenticated, admin)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.use('/', apiErrorHandler)

module.exports = router
