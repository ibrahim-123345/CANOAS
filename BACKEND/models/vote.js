const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contestant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contestant',
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  voteValue: {
    type: String,
    required: true,
    enum: ['strong_approve', 'approve', 'neutral', 'disapprove', 'strong_disapprove'], // optional but recommended for data integrity
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

// Enforce one vote per user per position
voteSchema.index({ voter: 1, position: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);
module.exports = { Vote };
