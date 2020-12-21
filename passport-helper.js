const LocalStrategy = require('passport-local').Strategy
const { User } = require('./models')

module.exports = (app, passport) => {

  passport.use(new LocalStrategy((username, password, done) => {
    User.authenticate(username, password)
    .then( user => {
      return done(null, user)
    })
    .catch( error => {
      return done(error)
    })
  }))

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => {
      if (error) return done(error)
      done(null, user)
    })
  })

  app.use(passport.initialize())
  app.use(passport.session())
}