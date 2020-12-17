const { Schema, model } = require('mongoose')

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

const User = model('User', userSchema)

module.exports = User