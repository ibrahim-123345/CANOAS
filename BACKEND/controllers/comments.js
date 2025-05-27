const { Comment } = require("../models/comments");
const { User } = require("../models/userModel");
const { Contestant } = require("../models/contestant");
const {connectToDatabase}=require('../config/connectionURI')


const createComment = async (req, res) => {
    await connectToDatabase();

  try {
    const {contestantId,comment,userId } = req.body;
    console.log(req.body);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) return res.status(404).json({ message: "Contestant not found" });

    const coment = new Comment({ content:comment, user: userId, contestant: contestantId });
    await coment.save();

    res.status(201).json(coment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error: error.message });
  }
};

const getCommentsForContestant = async (req, res) => {
    await connectToDatabase();

  try {
    const { contestantId } = req.params;

    const comments = await Comment.find({ contestant: contestantId })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve comments", error: error.message });
  }
};


const getAllcomments = async (req, res) => {
    await connectToDatabase();

  try {
    const comments = await Comment.find()
      .populate("user", "fullName email")
      .populate("contestant", "name party")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve comments", error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsForContestant,getAllcomments
};
