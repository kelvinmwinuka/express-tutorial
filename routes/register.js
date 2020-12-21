var router = require('express').Router()
const Joi = require('joi')
const { User } = require('../models')

const validateRegistrationInfo = async (req, res, next) => {
  for(let [key, value] of Object.entries(req.body)) {
    req.flash(`${key}`, value)
  }
  /* Validate the request parameters.
  If they are valid, continue with the request.
  Otherwise, flash the error and redirect to registration form. */
  const schema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().alphanum().min(6).max(12).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().min(8).required()
  })

  const error = schema.validate(req.body, { abortEarly: false }).error
  if (error) {
    error.details.forEach(currentError => {
      req.flash(`${currentError.context.label}_error`, currentError.message)
    })
    return res.redirect('/register')
  }

  /** Check if user exists */
  const userExists = await User.userExists(req.body)
  if (userExists) {
    for(let [key, message] of Object.entries(userExists)) {
      req.flash(`${key}`, message)
    }
    return res.redirect('/register')
  }

  next()  
}

router.get('/register', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/')
  res.render('register.html')
})

router.post('/register', validateRegistrationInfo, async (req, res) => {
  let savedUser = await (new User(req.body)).save()
  res.redirect('/')
})

module.exports = router