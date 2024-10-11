const passport = require('passport')
const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const bcrypt = require('bcryptjs')
const { User, Restaurant, Comment } = require('../models')

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (req, email, password, cb) => {
    User.findOne({ where: { email } }).then(user => {
      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))

      bcrypt.compare(password, user.password).then(isMatched => {
        if (!isMatched) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        return cb(null, user)
      })
    }).catch(err => cb(err))
  }
))

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, cb) => {
  return User.findByPk(jwtPayload.id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'likedRestaurants' },
      { model: User, as: 'followers' },
      { model: User, as: 'followings' },
      { model: Comment, include: [{ model: Restaurant }] }
    ]
  })
    .then(user => {
      if (!user) return cb(null, false)
      return cb(null, user)
    })
    .catch(err => cb(err))
}))

passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  return User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'likedRestaurants' },
      { model: User, as: 'followers' },
      { model: User, as: 'followings' },
      { model: Comment, include: [{ model: Restaurant }] }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})

module.exports = passport
