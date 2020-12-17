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

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.set('view engine', 'html')

app.get('/', async (req, res) => {
  res.render('home.html')
})

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

