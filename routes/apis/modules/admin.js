const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')
const adminController = require('../../../controllers/apis/admin-controller')

router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', upload.single('image'), adminController.putRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

router.put('/categories/:id', adminController.putCategory)
router.delete('/categories/:id', adminController.deleteCategory)
router.get('/categories', adminController.getCategories)
router.post('/categories', adminController.postCategory)

router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

module.exports = router
