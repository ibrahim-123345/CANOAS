const mongoose = require("mongoose");

const contestantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  party: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    required: true,
  },

  nidaNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  promises: {
    type: [String],
    default: [],
  },

  previousPromises: {
  type: [
    {
      promise: { type: String, required: true },
      fulfilled: { type: Boolean, required: true },
    }
  ],
  default: [],
}
,

  previousPosition: {
    type: String,
    default: null,
    required: false,
  },

  timeServed: {
    type: String,
    default: null,
    required: false,
  },

  profileImage: {
    type: String,
    default: null,
  },

  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vote",
    },
  ],

  position: {
    type: String,
    required: true,
  }

}, { timestamps: true });

const Contestant = mongoose.models.Contestant || mongoose.model("Contestant", contestantSchema);
module.exports = { Contestant };
