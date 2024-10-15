const db = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')
const userServices = require('../../services/user-services')

const { User, Comment, Restaurant, Followship } = db

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    return userServices.signUp(req, (err, data) => {
      if (err) return next(err)

      req.flash('success_messages', '成功註冊帳號！')
      return res.redirect('/signin')
    })
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
    const currentUser = req.user
    const isSameUser = currentUser.id === userId

    if (isSameUser) {
      try {
        const comments = []
        currentUser.Comments.forEach(comment => {
          if (!comments.some(c => c.restaurantId === comment.restaurantId)) {
            comments.push(comment)
          }
        })

        const targetUser = {
          ...currentUser,
          Comments: comments,
          commentsCount: comments.length,
          followingsCount: currentUser.followings.length,
          followersCount: currentUser.followers.length,
          favoritedRestaurantsCount: currentUser.FavoritedRestaurants.length,
          isSameUser
        }

        return res.render('users/profile', { targetUser })
      } catch (err) {
        return next(err)
      }
    } else {
      return User.findByPk(userId, {
        include: [
          {
            model: Comment,
            include: [{ model: Restaurant }]
          },
          {
            model: User,
            as: 'followings'
          },
          {
            model: User,
            as: 'followers'
          },
          {
            model: Restaurant,
            as: 'FavoritedRestaurants'
          }
        ]
      })
        .then(userData => {
          if (!userData) throw new Error('User didn\'t exist!')

          const comments = []
          userData.Comments.forEach(comment => {
            if (!comments.some(c => c.restaurantId === comment.restaurantId)) {
              comments.push(comment.toJSON())
            }
          })

          const targetUser = {
            ...userData.toJSON(),
            Comments: comments,
            commentsCount: comments.length,
            followingsCount: userData.followings.length,
            followersCount: userData.followers.length,
            favoritedRestaurantsCount: userData.FavoritedRestaurants.length,
            isSameUser,
            isFollowingByCurrentUser: currentUser.followings.some(f => f.id === userId)
          }
          return res.render('users/profile', { targetUser })
        })
        .catch(err => next(err))
    }
  },
  editUser: (req, res, next) => {
    const userId = +req.params.id

    if (req.user && userId !== req.user.id) {
      req.flash('error_messages', 'User didn\'t exist!')
      return res.redirect(`/users/${req.user.id}`)
    }

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
  },
  addFavorite: (req, res, next) => {
    return userServices.addFavorite(req, (err, data) => {
      if (err) return next(err)

      // req.session.createdFavorite = data // 還不知道怎麼利用先註解
      req.flash('success_messages', '已將餐廳加到您的喜愛清單！')
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res, next) => {
    return userServices.removeFavorite(req, (err, data) => {
      if (err) return next(err)

      // req.session.deletedFavorite = data // 還不知道怎麼利用先註解
      req.flash('success_messages', '已將餐廳從您的喜愛清單移除！')
      return res.redirect('back')
    })
  },
  addLike: (req, res, next) => {
    return userServices.addLike(req, (err, data) => {
      if (err) return next(err)

      // req.session.createdLike = data // 還不知道怎麼利用先註解
      req.flash('success_messages', '已將餐廳加到您的Like!')
      return res.redirect('back')
    })
  },
  removeLike: (req, res, next) => {
    return userServices.removeLike(req, (err, data) => {
      if (err) return next(err)

      // req.session.deletedLike = data // 還不知道怎麼利用先註解
      req.flash('success_messages', '已將餐廳從您的Like移除!')
      return res.redirect('back')
    })
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [
        { model: User, as: 'followers' }
      ]
    })
      .then(users => {
        users = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.followers.length,
            isFollowed: req.user && req.user.followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        return res.render('top-users', { users })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    const currentUser = req.user.id
    if (+userId === currentUser) throw new Error('You can\'t follow yourself!')

    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('User didn\'t exist!')
        if (followship) throw new Error('You are already following this user!')

        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => {
        req.flash('success_messages', '成功追蹤該使用者!')
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error('You haven\'t followed this user!')
        return followship.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功取消追蹤該使用者!')
        return res.redirect('back')
      })
      .catch(err => next(err))
  }
}

module.exports = userController
