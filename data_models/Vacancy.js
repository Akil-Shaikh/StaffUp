const mongoose = require('mongoose');

const VacancyModel = new mongoose.Schema({
  title: { type: String, required: true },
  dept: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  slots: {
    total: { type: Number, default: 3 },
    filled: { type: Number, default: 0 }
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  isClosed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', VacancyModel);