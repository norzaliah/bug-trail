const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['developer', 'tester', 'project-manager'], // Only these 3 roles
    default: 'developer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password; // Never send password in responses
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Encrypt password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role }, // Include role in token payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete user's bugs when user is deleted
UserSchema.pre('remove', async function(next) {
  await this.model('Bug').deleteMany({ owner: this._id });
  next();
});

// Virtual populate bugs
UserSchema.virtual('bugs', {
  ref: 'Bug',
  localField: '_id',
  foreignField: 'owner',
  justOne: false
});

module.exports = mongoose.model('User', UserSchema);