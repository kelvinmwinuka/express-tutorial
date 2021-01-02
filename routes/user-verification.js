const router = require('express').Router()
const { v4 } = require('uuid')
const { User, UserVerification } = require('../models')
const { sendEmail } = require('../helpers')

router.get('/verify', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  if (req.user.verified) return res.redirect('back')

  const token = v4().toString().replace(/-/g, '')
  const verificationUrl = `${process.env.DOMAIN}/verify-confirm/${token}`

  await UserVerification.updateOne({ 
    user: req.user._id 
  }, {
    user: req.user._id,
    token: token
  }, {
    upsert: true
  })

  sendEmail({
    to: req.user.email,
    subject: 'Verify your email address',
    text: `Here's your email verification link: ${verificationUrl}`
  })

  req.flash('verify_success', 'Check your email address for your verification link. It may take a few minutes')
  res.redirect('/profile')
})

router.get('/verify-confirm/:token', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  
  const token = req.params.token

  const userVerification = await UserVerification.findOne({
    user: req.user._id,
    token: token
  })

  if (userVerification) {
    await User.updateOne({ _id: req.user._id }, { verified: true })
    await UserVerification.deleteOne({ 
      user: req.user._id,
      token: token
    })
    sendEmail({
      to: req.user.email,
      subject: 'Verified',
      text: `Congratulations ${req.user.name}, your account is now verified!`
    })
    req.flash('verify_success', 'Congrats, you are now verified!')
  } else {
    req.flash('verify_error', 'Verification link is invalid or has expired.')
  }

  return res.redirect('/profile')
})

module.exports = router