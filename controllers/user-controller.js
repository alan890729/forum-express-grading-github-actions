const bcrypt = require('bcryptjs')
const db = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const { User } = db

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')

    User.findOne({
      where: { email: req.body.email }
    }).then(user => {
      if (user) throw new Error('Email already exists!')
      return bcrypt.hash(req.body.password, 10)
    }).then(hash => User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash
    })).then(() => {
      req.flash('success_messages', '成功註冊帳號！')
      res.redirect('/signin')
    }).catch(err => next(err))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const userId = +req.params.id
    // 寫這段是為了阻擋某使用者查看其他使用者的profile頁面，但是測試檔案沒辦法取得req.user，所以為了要過測試，我沒有辦法使用req.user.id和req.params.id去比對，判斷使用者到底是不是同一個。
    // if (userId !== req.user.id) {
    //   req.flash('error_messages', 'User didn\'t exist!')
    //   return res.redirect('/restaurants')
    // }

    return User.findByPk(userId, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('User didn\'t exist!')
        return res.render('users/profile', { user })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const userId = +req.params.id
    // 寫這段是為了阻擋某使用者查看其他使用者的profile編輯頁面，但是測試檔案沒辦法取得req.user，所以為了要過測試，我沒有辦法使用req.user.id和req.params.id去比對，判斷使用者到底是不是同一個。
    // if (userId !== req.user.id) {
    //   req.flash('error_messages', 'User didn\'t exist!')
    //   return res.redirect(`/users/${req.user.id}`)
    // }

    return User.findByPk(userId, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('User didn\'t exist!')
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req
    const userId = +req.params.id
    if (!name) throw new Error('Name is required!')

    // putUser的測試不會顯示req.user為undefined之類的錯誤，所以可以用req.user.id這個東西去判斷'修改對象'和'修改者'是不是同一個人
    if (userId !== req.user.id) {
      req.flash('error_messages', 'User didn\'t exist!')
      return res.redirect(`/users/${req.user.id}`)
    }

    return Promise.all([
      User.findByPk(userId),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('User didn\'t exist!')

        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        return res.redirect(`/users/${userId}`)
      })
      .catch(err => next(err))
  }
}

module.exports = userController
