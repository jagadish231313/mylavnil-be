const mongoose = require('mongoose');


// Appointments 
const AddressSchema = new mongoose.Schema({
  date: {
    type: String
  },
  status: {
    type: String
  },
  doctor: {
    type: String
  }
});


// Define a schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  Appointments: [AddressSchema]
});

// Create a model
const User = mongoose.model('User', userSchema);

module.exports = User;