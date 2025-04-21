const {Vote} = require('../models/vote');
const {Contestant }= require('../models/contestant');
const {User }= require('../models/userModel');

const castVote = async (req, res) => {
  try {
    const voterId = req.user._id; 
    const { contestantId } = req.body;

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }

    const existingVote = await Vote.findOne({
      voter: voterId,
      position: contestant.position,
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You already voted for this position' });
    }

    const newVote = new Vote({
      voter: voterId,
      contestant: contestant._id,
      position: contestant.position,
    });

    await newVote.save();

    contestant.votes.push(newVote._id);
    await contestant.save();

    res.status(201).json({ message: 'Vote cast successfully', vote: newVote });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cast vote', error: err.message });
  }
};

const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find().populate('voter', 'username').populate('contestant', 'name position');
    res.status(200).json(votes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch votes', error: err.message });
  }
};

const deleteVote = async (req, res) => {
  try {
    const voteId = req.params.id;

    const vote = await Vote.findById(voteId);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    await Contestant.findByIdAndUpdate(vote.contestant, {
      $pull: { votes: vote._id },
    });

    await vote.deleteOne();
    res.status(200).json({ message: 'Vote deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vote', error: err.message });
  }
};

module.exports = {
  castVote,
  getVotes,
  deleteVote,
};
