const { Op } = require('sequelize')

const { Restaurant, Category, User, Comment, sequelize } = require('../models')
const pagination = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9

    const currentPage = +req.query.page || 1
    const limit = +req.query.limit || DEFAULT_LIMIT
    const offset = limit * (currentPage - 1)
    let categoryId
    let where

    if (+req.query.categoryId) {
      categoryId = +req.query.categoryId
      where = { categoryId }
    } else if (req.query.categoryId === 'uncategorized') {
      categoryId = 'uncategorized'
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
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(r => r.id) : []
        const likedRestaurantsId = req.user?.likedRestaurants ? req.user.likedRestaurants.map(r => r.id) : []

        const restaurants = restaurantsData.rows
          .map(r => ({
            ...r.toJSON(),
            description: r.description?.substring(0, 50),
            isFavorited: favoritedRestaurantsId.includes(r.id),
            isLiked: likedRestaurantsId.includes(r.id)
          }))

        return cb(null, {
          restaurants,
          categories,
          categoryId,
          paginator: pagination.generatePaginatorForRender(restaurantsData.count, currentPage, limit)
        })
      })
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Comment,
          include: [{ model: User, attributes: { exclude: ['password'] } }]
        },
        { model: User, as: 'FavoritedUsers', attributes: { exclude: ['password'] } },
        { model: User, as: 'likedUsers', attributes: { exclude: ['password'] } }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        return restaurant.increment('viewCounts')
          .then(restaurant => restaurant.reload())
      })
      .then(restaurant => {
        restaurant = {
          ...restaurant.toJSON(),
          isFavorited: restaurant.FavoritedUsers.some(u => u.id === req.user.id),
          isLiked: restaurant.likedUsers.some(u => u.id === req.user.id)
        }
        return cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    return sequelize.query(
      `
        SELECT Restaurants.id,
               Restaurants.name,
               Restaurants.tel,
               Restaurants.address,
               Restaurants.opening_hours,
               Restaurants.description,
               Restaurants.created_at,
               Restaurants.updated_at,
               Restaurants.image,
               Restaurants.category_id,
               Restaurants.view_counts,
               COUNT(Favorites.id) AS favoritedCount
        FROM Restaurants
        LEFT OUTER JOIN Favorites
        ON Restaurants.id = Favorites.restaurant_id
        GROUP BY Restaurants.id
        ORDER BY favoritedCount DESC
        LIMIT 10
      `
    )
      .then(([results, metadata]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(r => r.id) : []

        const restaurants = results.map(r => ({
          ...r,
          description: r.description?.slice(0, 50),
          isFavorited: favoritedRestaurantsId.some(frId => frId === r.id)
        }))
        return cb(null, { restaurants })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantServices
