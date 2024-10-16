const express = require('express')
const router = express.Router()

const passport = require('../../config/passport')
const admin = require('./modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const feedController = require('../../controllers/apis/feed-controller')
const { authenticated, adminAuthenticated } = require('../../middleware/apiAuth')
const { apiErrorHandler } = require('../../middleware/error-handler')
const upload = require('../../middleware/multer')

router.use('/admin', authenticated, adminAuthenticated, admin)

router.post(
  '/signin',
  (req, res, next) => {
    return passport.authenticate('local', { session: false }, (err, user) => {
      if (err) return next(err)
      if (!user) return res.json({ status: 'error', message: 'wrong email or password!' })

      req.user = user
      return next()
    })(req, res, next)
  },
  userController.signIn)
router.post('/signup', userController.signUp)

router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.get('/feeds/newest-restaurants', authenticated, feedController.getNewestRestaurants)
router.get('/feeds/newest-comments', authenticated, feedController.getNewestComments)

router.get('/restaurants/top', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.post('/comments', authenticated, commentController.postComment)

router.post('/favorites/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorites/:restaurantId', authenticated, userController.removeFavorite)

router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.use('/', apiErrorHandler)

module.exports = router
