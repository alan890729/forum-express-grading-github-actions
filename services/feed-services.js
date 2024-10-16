const { Restaurant, Category, Comment, User } = require('../models')

const feedServices = {
  getNewestRestaurants: cb => {
    return Restaurant.findAll({
      include: [
        { model: Category }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    })
      .then(newestRestaurants => {
        if (!cb) return newestRestaurants.map(r => r.toJSON())
        return cb(null, { restaurants: newestRestaurants.map(r => r.toJSON()) })
      })
      .catch(err => {
        if (!cb) throw err
        return cb(err)
      })
  },
  getNewestComments: cb => {
    return Comment.findAll({
      include: [
        { model: Restaurant },
        { model: User, attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    })
      .then(newestComments => {
        if (!cb) return newestComments.map(c => c.toJSON())
        return cb(null, { comments: newestComments.map(c => c.toJSON()) })
      })
      .catch(err => {
        if (!cb) throw err
        return cb(err)
      })
  }
}

module.exports = feedServices
