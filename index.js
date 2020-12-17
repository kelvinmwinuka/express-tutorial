if (process.env.ENV === 'dev') require('dotenv').config()

const express = require('express')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
// Import models
const { User } = require('./models')

var app = express()

const connection = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('connected!')
})

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.set('view engine', 'html')

const PORT = '8000'

app.get('/', async (req, res) => {
  const users = await User.find({})
  if (users.length) {
    console.log(users)
  } else {
    let newUser = new User({
      name: 'Kelvin Mwinuka',
      email: 'email@kelvinmwinuka.com',
      username: 'kelvin',
      password: 'password'
    })
    let savedUser = await newUser.save()
    console.log(savedUser)
  }
  res.render('home.html')
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

