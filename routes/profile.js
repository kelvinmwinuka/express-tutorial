const { route } = require('./register')

const router = require('express').Router()

router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  return res.render('profile.html')
})

module.exports = router