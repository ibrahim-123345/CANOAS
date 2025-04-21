// models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
  },
  contestant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contestant',
    required: true,
  },
  position: {
    type: String,
    required: true,
  }
}, { timestamps: true });

voteSchema.index({ voter: 1, position: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
module.exports = {Vote};
