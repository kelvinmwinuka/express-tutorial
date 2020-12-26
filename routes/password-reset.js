const router  = require('express').Router()
const { User, PasswordReset } = require('../models')
const { v4 } = require('uuid')
const { sendEmail } = require('../helpers')

router.get('/reset', (req, res) => res.render('reset.html'))

router.post('/reset', async (req, res) => {
  /* Flash email address for pre-population in case we redirect back to reset page. */
  req.flash('email', req.body.email)

  /* Check if user with provided email exists. */
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    req.flash('error', 'User not found')
    return res.redirect('/reset')
  }

  /* Create password reset token and save in collection along with user. 
     If there already is a record with current user, replace it. */
  const token = v4().toString().replace(/-/g, '')
  PasswordReset.updateOne({ 
    user: user._id 
  }, {
    user: user._id,
    token: token
  }, {
    upsert: true
  })
  .then( updateResponse => {
    /* Send email to user containing password reset link. */
    const resetLink = `${process.env.DOMAIN}/reset-confirm/${token}`
    sendEmail({
      to: user.email, 
      subject: 'Password Reset',
      text: `Hi ${user.name}, here's your password reset link: ${resetLink}. 
      If you did not request this link, ignore it.`
    })
    console.log(resetLink)

    req.flash('success', 'Check your email address for the password reset link!')
    return res.redirect('/login')
  })
  .catch( error => {
    req.flash('error', 'Failed to generate reset link, please try again')
    return res.redirect('/reset')
  })
})

router.get('/reset-confirm/:token', async (req, res) => {
  const token = req.params.token
  const passwordReset = await PasswordReset.findOne({ token })
  res.render('reset-confirm.html', { 
    token: token,
    valid: passwordReset ? true : false
  })
})

router.post('/reset-confirm/:token', async (req, res) => {
  const token = req.params.token
  const passwordReset = await PasswordReset.findOne({ token })
  
  /* Update user */
  let user = await User.findOne({ _id: passwordReset.user })
  user.password = req.body.password
  
  user.save().then( async savedUser =>  {
    /* Delete password reset document in collection */
    await PasswordReset.deleteOne({ _id: passwordReset._id })
    /* Send successful password reset email */
    sendEmail({
      to: user.email, 
      subject: 'Password Reset Successful',
      text: `Congratulations ${user.name}! Your password reset was successful.`
    })
    /* Redirect to login page with success message */
    req.flash('success', 'Password reset successful')
    res.redirect('/login')
  }).catch( error => {
    /* Redirect back to reset-confirm page */
    req.flash('error', 'Failed to reset password please try again')
    return res.redirect(`/reset-confirm/${token}`)
  })
})

module.exports = router