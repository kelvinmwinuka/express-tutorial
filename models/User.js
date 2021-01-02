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
  },
  verified: {
    type: Schema.Types.Boolean,
    required: true,
    default: false
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

userSchema.static({

  userExists: async function ({ username, email }) {
    let user = await this.findOne({ username })
    if (user) return { username_error: 'This username is already in use' }
    user = await this.findOne({ email })
    if (user) return { email_error: 'This email address is already in use' }
    return false
  },

  authenticate: async function (username, plainTextPassword) {
    const user = await this.findOne({ $or: [{ email: username }, { username }] })
    if (user && await bcrypt.compare(plainTextPassword, user.password)) return user
    return false
  },

  findByUsername: async function(username) {
    const user = await this.findOne({ username })
    return user
  }
})

userSchema.method({

  follow: async function(followeeId) {
    /* Check if followee exists */
    let followee = await model('User').findOne({ _id: followeeId })
    if (!followee) return false
    
    /* Insert followee Id to current user's following array */
    this.following.push(followeeId)
    await this.save()

    /* Place current user's Id in followee's followers array */
    followee.followers.push(this._id)
    await followee.save()

    return this
  },

  unfollow: async function(followeeId) {
    let followee = await model('User').findOne({ _id: followeeId })
    
    /* Remove the followee from current user's following array. */
    this.following = this.following.filter( id => id.toString() !== followeeId)
    await this.save()
    
    /* Remove current user from followee's followers array. */
    followee.followers = followee.followers.filter( id => id.toString() !== this._id.toString() )
    await followee.save()

    return this
  },

  removeFollower: async function(followerId) {
    let follower = await model('User').findOne({ _id: followerId })

    /* Remove follower from current user's follwers array. */
    this.followers = this.followers.filter( id => id.toString() !== followerId )
    this.save()

    /* Remove current user from follower's following array. */
    follower.following = follower.following.filter( id => id.toString() !== this._id.toString() )
    follower.save()

    return this
  }
})

const User = model('User', userSchema)

module.exports = User