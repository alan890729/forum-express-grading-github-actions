const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

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
