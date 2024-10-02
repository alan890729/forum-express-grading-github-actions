const { Op } = require('sequelize')
const { Restaurant, Category, Comment, User, Sequelize } = require('../models')
const pagination = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9

    const currentPage = +req.query.page || 1
    const limit = +req.query.limit || DEFAULT_LIMIT
    const offset = limit * (currentPage - 1)
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
      Restaurant.findAndCountAll({
        where,
        include: [
          { model: Category }
        ],
        limit,
        offset
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurantsData, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.favoritedRestaurants.map(r => r.id) // I think using 'req.user &&...' is for testing purpose.
        const likedRestaurantsId = req.user && req.user.likedRestaurants.map(r => r.id)

        const restaurants = restaurantsData.rows
          .map(r => r.toJSON())
          .map(r => ({
            ...r,
            description: r.description.substring(0, 50),
            isFavorited: favoritedRestaurantsId.includes(r.id),
            isLiked: likedRestaurantsId.includes(r.id)
          }))

        pagination.generatePaginatorForRender(res, restaurantsData.count, currentPage, limit)

        return res.render('restaurants', { restaurants, categories, categoryId })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Comment,
          include: [
            { model: User }
          ]
        },
        { model: User, as: 'favoritedUsers' },
        { model: User, as: 'likedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        return restaurant.increment('viewCounts')
      })
      .then(restaurantData => {
        const restaurant = restaurantData.toJSON()
        restaurant.isFavorited = restaurant.favoritedUsers.some(u => u.id === req.user.id)
        restaurant.isLiked = restaurant.likedUsers.some(u => u.id === req.user.id)
        return res.render('restaurant', { restaurant })
      })
      .catch(err => next(err))
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
      Restaurant.findAll({
        include: [{ model: Category }],
        order: [['createdAt', 'DESC']],
        limit: 10
      }),
      Comment.findAll({
        include: [
          { model: Restaurant },
          { model: User }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ])
      .then(([restaurantsData, commentsData]) => {
        const restaurants = restaurantsData.map(restaurant => restaurant.toJSON())
        const comments = commentsData.map(comment => comment.toJSON())
        return res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
