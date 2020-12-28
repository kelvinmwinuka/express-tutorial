const { Schema, model } = require('mongoose')

const schema = new Schema({
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: Schema.Types.String,
    required: true
  }
})

const UserVerification = model('UserVerification', schema)

module.exports = UserVerification