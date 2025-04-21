const mongoose = require("mongoose");

const contestantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  manifesto: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: "", 
  },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vote",
    },
  ],
}, { timestamps: true });

const Contestant= mongoose.models.Contestant || mongoose.model("Contestant", contestantSchema);

module.exports = { Contestant };
