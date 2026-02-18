const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
  vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
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
module.exports = mongoose.model('Application', ApplicationSchema);