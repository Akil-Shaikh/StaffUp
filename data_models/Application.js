const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy_jwt', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account_jwt', required: true },
  resumePath: String,
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Hired', 'Dropped','Closed'], default: 'Applied' },
  details: { exp: String, notes: String },
  jobRemoved: {
    type: Boolean,
    default: false
  },
  jobRemovedMessage: {
    type: String
  }

}, { timestamps: true });
module.exports = mongoose.model('Application_jwt', ApplicationSchema);