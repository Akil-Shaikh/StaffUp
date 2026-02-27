const mongoose = require('mongoose');

const AccountModel = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'recruiter'], required: true },
  meta: {
    experience: String, company: String,
  },
  cvPath: String
})


module.exports = mongoose.model('Account_jwt', AccountModel);