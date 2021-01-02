if (process.env.ENV === 'dev') require('dotenv').config()

const express = require('express')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')
const passport = require('passport')
const initializePassport = require('./passport-helper')

// Import models
const { User } = require('./models')

var app = express()
app.use(express.urlencoded({extended: true}))

const connection = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions'
  }),
  cookie: {
    secure: false
  }
}))

var env = nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.set('view engine', 'html')

app.use(flash())

initializePassport(app, passport)

app.use((req, res, next) => {
  // Add user details to global variables accessible by nunjucks
  env.addGlobal('me', req.user)
  next()
})

app.get('/', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login')
  res.render('home.html')
})

// Import rotues
app.use('/', require('./routes/register'))
app.use('/', require('./routes/auth')(passport))
app.use('/', require('./routes/password-reset'))
app.use('/', require('./routes/profile'))
app.use('/', require('./routes/user-verification'))
app.use('/user', require('./routes/user'))

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`)
})

