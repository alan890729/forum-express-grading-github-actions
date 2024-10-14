const { Op } = require('sequelize')

const { Restaurant, Category, User } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')
const pagination = require('../helpers/pagination-helper')

const adminServices = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 20
    const limit = +req.query.limit || DEFAULT_LIMIT
    const currentPage = +req.query.page || 1
    const offset = (currentPage - 1) * limit

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
          {
            model: Category
          }
        ],
        limit,
        offset,
        raw: true,
        nest: true
      }),
      Category.findAll({
        raw: true
      })
    ])
      .then(([restaurants, categories]) => {
        return cb(null, {
          restaurants: restaurants.rows,
          categories,
          categoryId,
          paginator: pagination.generatePaginatorForRender(restaurants.count, currentPage, limit)
        })
      })
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')

        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req

    return Category.findByPk(categoryId)
      .then(category => {
        if (!category) throw new Error('Category doesn\'t exist!')
        return localFileHandler(file)
      })
      .then(filePath => {
        return Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        })
      })
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  },
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: Category
        }
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')

        return cb(null, { restaurant: restaurant.toJSON() })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    const { file } = req

    if (!name) throw new Error('Restaurant name is required!')

    return Promise.all([
      Restaurant.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        if (restaurant.categoryId !== null && (categoryId === 'uncategorized' || categoryId === null)) {
          throw new Error('The category of a restaurant can\'t manually set to null.')
        }

        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId: categoryId === 'uncategorized' || categoryId === null ? null : categoryId
        })
      })
      .then(updatedRestaurant => {
        return cb(null, { restaurant: updatedRestaurant })
      })
      .catch(err => cb(err))
  },
  getCategories: cb => {
    return Category.findAll()
      .then(categories => {
        categories = categories.map(c => c.toJSON())
        return cb(null, { categories })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const name = req.body.name?.trim()
    if (!name) throw new Error('A category name is required!')

    return Category.create({ name })
      .then(createdCategory => {
        return cb(null, { categories: createdCategory.toJSON() })
      })
      .catch(err => cb(err))
  },
  putCategory: (req, cb) => {
    const name = req.body.name?.trim()
    if (!name) throw new Error('A category name is required!')

    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category didn\'t exist!')
        return category.update({ name })
      })
      .then(updatedCategory => {
        return cb(null, { category: updatedCategory.toJSON() })
      })
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category didn\'t exist!')
        return category.destroy()
      })
      .then(deletedCategory => {
        return cb(null, { category: deletedCategory.toJSON() })
      })
      .catch(err => cb(err))
  },
  getUsers: cb => {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin']
    })
      .then(users => {
        users = users.map(u => u.toJSON())
        return cb(null, { users })
      })
      .catch(err => cb(err))
  }
}

module.exports = adminServices
