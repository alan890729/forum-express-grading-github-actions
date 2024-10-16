const db = require('../../models')
const userServices = require('../../services/user-services')

const { User, Comment, Restaurant } = db

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
      return userServices.getUser(
        req,
        [
          { model: Comment, include: [{ model: Restaurant }] },
          { model: User, as: 'followings', attributes: { exclude: ['password'] } },
          { model: User, as: 'followers', attributes: { exclude: ['password'] } },
          { model: Restaurant, as: 'FavoritedRestaurants' }
        ]
      )
        .then(userData => {
          const comments = []
          userData.Comments.forEach(comment => {
            if (!comments.some(c => c.restaurantId === comment.restaurantId)) {
              comments.push(comment)
            }
          })

          const targetUser = {
            ...userData,
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
    return userServices.putUser(req, (err, data) => {
      if (err) return next(err)

      // req.session.updatedUser = data // 還沒有利用到先註解
      req.flash('success_messages', '使用者資料編輯成功')
      return res.redirect(`/users/${req.user.id}`)
    })
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
    return userServices.addFollowing(req, (err, data) => {
      if (err) return next(err)

      // req.session.createdFollowship = data // 還不會利用先註解
      req.flash('success_messages', '成功追蹤該使用者!')
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res, next) => {
    return userServices.removeFollowing(req, (err, data) => {
      if (err) return next(err)

      // req.session.deletedFollowship = data // 還不會利用先註解
      req.flash('success_messages', '成功取消追蹤該使用者!')
      return res.redirect('back')
    })
  }
}

module.exports = userController
