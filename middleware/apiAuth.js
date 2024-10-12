const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })

    req.user = user
    return next()
  })(req, res, next)
}

const adminAuthenticated = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()

  return res.status(403).json({
    status: 'error',
    message: 'access denied!'
  })
}

module.exports = {
  authenticated,
  adminAuthenticated
}
