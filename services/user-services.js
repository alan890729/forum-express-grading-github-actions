const bcrypt = require('bcryptjs')

const { User, Restaurant, Favorite, Like } = require('../models')

const userServices = {
  signUp: (req, cb) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({
      where: { email: req.body.email }
    })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(createdUser => {
        const user = createdUser.toJSON()
        delete user.password

        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const restaurantId = +req.params.restaurantId
    const userId = req.user.id

    if (restaurantId < 1 || !Number.isInteger(restaurantId)) throw new Error('restaurantId should be a positive integer!')

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId),
      Favorite.findOne({
        where: {
          restaurantId,
          userId
        }
      })
    ])
      .then(([restaurant, user, favorite]) => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        if (!user) throw new Error('User didn\'t exist!')
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({ restaurantId, userId })
      })
      .then(createdFavorite => {
        return cb(null, { favorite: createdFavorite.toJSON() })
      })
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    const restaurantId = +req.params.restaurantId
    const userId = req.user.id

    if (restaurantId < 1 || !Number.isInteger(restaurantId)) throw new Error('restaurantId should be a positive integer!')

    return Favorite.findOne({
      where: {
        restaurantId,
        userId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error('You haven\'t favorited this restaurant!')

        return favorite.destroy()
      })
      .then(deletedFavorite => {
        return cb(null, { favorite: deletedFavorite.toJSON() })
      })
      .catch(err => cb(err))
  },
  addLike: (req, cb) => {
    const restaurantId = +req.params.restaurantId
    const userId = req.user.id

    if (restaurantId < 1 || !Number.isInteger(restaurantId)) throw new Error('restaurantId should be a positive integer!')

    return Promise.all([
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId),
      Like.findOne({
        where: {
          restaurantId,
          userId
        }
      })
    ])
      .then(([restaurant, user, like]) => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        if (!user) throw new Error('User didn\'t exist!')
        if (like) throw new Error('You have liked this restaurant!')

        return Like.create({ restaurantId, userId })
      })
      .then(createdLike => {
        return cb(null, { like: createdLike.toJSON() })
      })
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    const restaurantId = +req.params.restaurantId
    const userId = req.user.id

    if (restaurantId < 1 || !Number.isInteger(restaurantId)) throw new Error('restaurantId should be a positive integer!')

    return Like.findOne({
      where: {
        restaurantId,
        userId
      }
    })
      .then(like => {
        if (!like) throw new Error('You haven\'t liked this restaurant!')

        return like.destroy()
      })
      .then(deletedLike => {
        return cb(null, { like: deletedLike.toJSON() })
      })
      .catch(err => cb(err))
  }
}

module.exports = userServices
