const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // We can add more later (like userType: 'host' or 'guest')
});

module.exports = mongoose.model('User', userSchema);