const router = require('express').Router()
const { User } = require('../models')

router.get('/:username', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  if (req.user.username === req.params.username) return res.redirect('/profile')

  const user = await User.findByUsername(req.params.username)
  return res.render('user.html', { user })
})

router.post('/follow', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  
  const me = await User.findById(req.user._id)

  /* Make sure current user's id doesn't match followeeId to
     prevent the user from following themselves. */
  if (req.user._id !== req.body.followeeId){
    await me.follow(req.body.followeeId)
  }

  return res.redirect('back')
})

router.post('/unfollow', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')

  const me = await User.findById(req.user._id)
  await me.unfollow(req.body.followeeId)

  return res.redirect('back')
})

router.post('/remove', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')

  const me = await User.findById(req.user._id)
  await me.remove(req.body.followerId)

  return res.redirect('back')
})

module.exports = router