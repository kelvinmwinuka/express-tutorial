const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt')

const saltRounds = 10

var userSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, 'You must provide a name']
  },
  email: {
    type: Schema.Types.String,
    required: [true, 'Email address is required']
  },
  username: {
    type: Schema.Types.String,
    required: [true, 'Username is required']
  },
  password: {
    type: Schema.Types.String,
    required: [true, 'You must provide a password']
  }
})

userSchema.pre('save', async function(next){
  if (this.isNew) this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

userSchema.static('userExists', async function({username, email}){
  let user = await this.findOne({ username })
  if (user) return { username_error: 'This username is already in use' }
  user = await this.findOne({ email })
  if (user) return { email_error: 'This email address is already in use' }
  return false
})

userSchema.static('authenticate', async function(username, plainTextPassword){
  const user = await this.findOne({ $or: [ {email: username}, {username} ] })
  if (user && await bcrypt.compare(plainTextPassword, user.password)) return user
  return false
})

const User = model('User', userSchema)

module.exports = User