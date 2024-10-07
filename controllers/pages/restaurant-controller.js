const { Op } = require('sequelize')
const { Restaurant, Category, Comment, User, Sequelize } = require('../../models')
const pagination = require('../../helpers/pagination-helper')

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
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(r => r.id) // I think using 'req.user &&...' is for testing purpose.
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
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'likedUsers' }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        return restaurant.increment('viewCounts')
      })
      .then(restaurantData => {
        const restaurant = restaurantData.toJSON()
        restaurant.isFavorited = restaurant.FavoritedUsers.some(u => u.id === req.user.id)
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
  },
  getTopRestaurants: (req, res, next) => {
    // this one is faster but can't pass the test =_= .
    // remember to inport sequelize from ../models, otherwise the sequelize.query won't work.

    // return sequelize.query(
    //   `
    //              SELECT Restaurants.id,
    //                     Restaurants.name,
    //                     Restaurants.tel,
    //                     Restaurants.address,
    //                     Restaurants.opening_hours,
    //                     Restaurants.description,
    //                     Restaurants.image,
    //                     Restaurants.view_counts,
    //                     Restaurants.created_at,
    //                     Restaurants.updated_at,
    //                     Restaurants.category_id,
    //                     COUNT(Favorites.restaurant_id) AS favoritedCount
    //                FROM Restaurants
    //     LEFT OUTER JOIN Favorites
    //                  ON Restaurants.id = Favorites.restaurant_id
    //            GROUP BY Restaurants.id
    //            ORDER BY favoritedCount DESC
    //               LIMIT 10;
    //   `
    // )
    //   .then(([restaurants, metadata]) => {
    //     const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)

    //     restaurants = restaurants
    //       .map(r => ({
    //         ...r,
    //         description: r.description.slice(0, 50),
    //         isFavorited: req.user && favoritedRestaurantsId.some(frId => frId === r.id)
    //       }))

    //     return res.render('top-restaurants', { restaurants })
    //   })
    //   .catch(err => next(err))

    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurants => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)

        restaurants = restaurants
          .map(r => ({
            ...r.toJSON(),
            description: r.description.slice(0, 50),
            favoritedCount: r.FavoritedUsers.length,
            isFavorited: req.user && favoritedRestaurantsId.some(frId => frId === r.id)
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount)
          .slice(0, 10)

        return res.render('top-restaurants', { restaurants })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
