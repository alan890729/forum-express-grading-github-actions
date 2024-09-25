const { Op } = require('sequelize')
const { Restaurant, Category } = require('../models')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    let categoryId
    let where

    if (+req.query.categoryId) {
      categoryId = +req.query.categoryId
      where = { categoryId }
    } else if (req.query.categoryId === 'noCategory') {
      categoryId = 'noCategory'
      where = {
        categoryId: {
          [Op.is]: null
        }
      }
    } else {
      categoryId = ''
      where = {}
    }

    return Promise.all([
      Restaurant.findAll({
        where,
        include: [
          {
            model: Category
          }
        ],
        raw: true,
        nest: true
      }),
      Category.findAll({
        raw: true
      })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50)
        }))

        return res.render('restaurants', { restaurants: data, categories, categoryId })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')

        return restaurant.increment('viewCounts')
          .then(() => {
            return res.render('restaurant', { restaurant: restaurant.toJSON() })
          })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category }
      ],
      raw: true,
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')

        return res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
