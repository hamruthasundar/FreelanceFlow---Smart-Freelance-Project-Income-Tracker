const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  clientName: {
    type: String,
    required: true
  },

  budget: {
    type: Number,
    required: true
  },

  deadline: {
    type: Date
  },

  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  userId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Project', projectSchema);