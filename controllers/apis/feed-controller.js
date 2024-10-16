const feedServices = require('../../services/feed-services')

const feedController = {
  getNewestRestaurants: (req, res, next) => {
    return feedServices.getNewestRestaurants((err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getNewestComments: (req, res, next) => {
    return feedServices.getNewestComments((err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = feedController
