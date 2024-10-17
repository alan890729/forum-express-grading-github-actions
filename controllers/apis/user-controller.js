const jwt = require('jsonwebtoken')

const userServices = require('../../services/user-services')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      return res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      return next(err)
    }
  },
  signUp: (req, res, next) => {
    return userServices.signUp(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFavorite: (req, res, next) => {
    return userServices.addFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeFavorite: (req, res, next) => {
    return userServices.removeFavorite(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addLike: (req, res, next) => {
    return userServices.addLike(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeLike: (req, res, next) => {
    return userServices.removeLike(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putUser: (req, res, next) => {
    return userServices.putUser(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserComments: (req, res, next) => {
    return userServices.getUserComments(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserFavorites: (req, res, next) => {
    return userServices.getUserFavorites(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserFollowings: (req, res, next) => {
    return userServices.getUserFollowings(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUserFollowers: (req, res, next) => {
    return userServices.getUserFollowers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addFollowing: (req, res, next) => {
    return userServices.addFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  removeFollowing: (req, res, next) => {
    return userServices.removeFollowing(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = userController
