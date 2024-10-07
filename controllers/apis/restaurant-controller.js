const { Op } = require('sequelize')

const { Restaurant, Category } = require('../../models')
const pagination = require('../../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res) => {
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
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(r => r.id) : []
        const likedRestaurantsId = req.user?.likedRestaurants ? req.user.likedRestaurants.map(r => r.id) : []

        const restaurants = restaurantsData.rows
          .map(r => ({
            ...r.toJSON(),
            description: r.description.substring(0, 50),
            isFavorited: favoritedRestaurantsId.includes(r.id),
            isLiked: likedRestaurantsId.includes(r.id)
          }))

        return res.json({
          restaurants,
          categories,
          categoryId,
          paginator: pagination.generatePaginatorForRender(restaurantsData.count, currentPage, limit)
        })
      })
  }
}

module.exports = restaurantController
