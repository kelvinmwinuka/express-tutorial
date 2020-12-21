const createLoginRoutes = passport => {
  const router = require('express').Router()

  router.get('/login', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/')
    res.render('login.html')
  })
  
  router.post(
    '/login',
    passport.authenticate('local', {
      failureRedirect: '/login', 
      successRedirect: '/',
      failureFlash: 'User not found',
    }),
    (error, req, res, next) => {
      if (error) next(error)
    }
  )

  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/login')
  })
  
  return router
}

module.exports = createLoginRoutes