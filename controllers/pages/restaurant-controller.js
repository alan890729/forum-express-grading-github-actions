const { Restaurant, Category, Comment, Sequelize } = require('../../models')
const feedServices = require('../../services/feed-services')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    return restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Comment,
          attributes: [
            [Sequelize.fn('count', Sequelize.col('text')), 'amountOfComment']
          ]
        }
      ],
      raw: true,
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')

        return res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      feedServices.getNewestRestaurants(),
      feedServices.getNewestComments()
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return restaurantServices.getTopRestaurants(req, (err, data) => {
      if (err) return next(err)

      return res.render('top-restaurants', data)
    })
  }
}

module.exports = restaurantController
