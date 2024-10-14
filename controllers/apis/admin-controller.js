const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    return adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteRestaurant: (req, res, next) => {
    return adminServices.deleteRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postRestaurant: (req, res, next) => {
    return adminServices.postRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getRestaurant: (req, res, next) => {
    return adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putRestaurant: (req, res, next) => {
    return adminServices.putRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getCategories: (req, res, next) => {
    return adminServices.getCategories((err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postCategory: (req, res, next) => {
    return adminServices.postCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putCategory: (req, res, next) => {
    return adminServices.putCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = adminController
