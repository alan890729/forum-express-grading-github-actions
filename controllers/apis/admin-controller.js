const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    return adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = adminController
