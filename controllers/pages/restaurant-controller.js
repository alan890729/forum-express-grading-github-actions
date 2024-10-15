const { Restaurant, Category, Comment, User, Sequelize } = require('../../models')
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
