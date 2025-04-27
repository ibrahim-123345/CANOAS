const mongoose = require("mongoose");

const contestantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  party:{
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  nidaNumber: {
    type: String,
    required: false,
    unique: true,
  },
  promises: {
    type: [String],
    default: "", 
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

  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Contestant= mongoose.models.Contestant || mongoose.model("Contestant", contestantSchema);

module.exports = { Contestant };
