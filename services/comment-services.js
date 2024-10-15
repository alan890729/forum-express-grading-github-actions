const { Restaurant, User, Comment } = require('../models')

const commentServices = {
  postComment: (req, cb) => {
    if (typeof req.body.text !== 'string') throw new Error('Comment text should be string!')
    const text = req.body.text?.trim()
    const restaurantId = +req.body.restaurantId
    const userId = req.user.id

    if (!text) throw new Error('Comment text is required!')
    if (restaurantId < 1 || !Number.isInteger(restaurantId)) throw new Error('restaurantId must be a positive integer!')

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId)
    ])
      .then(([restaurant, user]) => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        if (!user) throw new Error('User didn\'t exist!')

        return Comment.create({ text, restaurantId, userId })
      })
      .then(createdComment => {
        return cb(null, { comment: createdComment })
      })
      .catch(err => cb(err))
  }
}

module.exports = commentServices
