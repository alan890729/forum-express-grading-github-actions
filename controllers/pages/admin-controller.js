const { Restaurant, Category } = require('../../models')
const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    return adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    return adminServices.postRestaurant(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', 'restaurant was successfully created')
      req.session.createdData = data // 目前不知道這可以幹嘛，怎麼利用
      return res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    return adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('admin/restaurant', data))
  },
  editRestaurant: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, {
        raw: true
      }),
      Category.findAll({
        raw: true
      })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    return adminServices.putRestaurant(req, (err, data) => {
      if (err) return next(err)

      // req.session.updatedData = data // 還不確定要怎麼利用就先不打開了
      req.flash('success_messages', 'restaurant was successfully to update')
      return res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res, next) => {
    return adminServices.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.session.deletedData = data // 目前不知道這可以幹嘛，怎麼利用
      return res.redirect('/admin/restaurants')
    })
  },
  getUsers: (req, res, next) => {
    return adminServices.getUsers((err, data) => {
      if (err) return next(err)

      // req.session.users = data // 還不確定要怎麼利用就先不打開了
      return res.render('admin/users', { users: data.users })
    })
  },
  patchUser: (req, res, next) => {
    return adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)

      // req.session.updatedUser = data // 還不確定要怎麼利用就先不打開了
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')
    })
  }
}

module.exports = adminController
