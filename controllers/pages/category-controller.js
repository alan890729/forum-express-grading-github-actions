const { Category } = require('../../models')
const adminServices = require('../../services/admin-services')

const categoryController = {
  getCategories: (req, res, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      Category.findByPk(req.params.id, { raw: true })
    ])
      .then(([categories, category]) => {
        res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    return adminServices.postCategory(req, (err, data) => {
      if (err) return next(err)

      // req.session.createdCategory = data // 還不確定怎麼運用，先註解掉
      req.flash('success_messages', '新增成功！')
      return res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res, next) => {
    return adminServices.putCategory(req, (err, data) => {
      if (err) return next(err)

      // req.session.updatedCategory = data // 還不確定怎麼運用，先註解掉
      req.flash('success_messages', '編輯成功！')
      return res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('Category didn\'t exist!')

        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', '刪除成功！')
        return res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
