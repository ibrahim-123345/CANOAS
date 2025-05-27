const { Vote } = require('../models/vote');
const { Contestant } = require('../models/contestant');
const { User } = require('../models/userModel');
const { connectToDatabase } = require('../config/connectionURI');

// Vote weight logic
const calculateVotePercentage = (voteValue) => {
  switch (voteValue) {
    case 'strong_approve': return 100;
    case 'approve': return 75;
    case 'neutral': return 50;
    case 'disapprove': return 25;
    case 'strong_disapprove': return 0;
    default: return 0;
  }
};

const castVote = async (req, res) => {
  try {
    const { candidateId, voteValue, userVoted, position } = req.body;

    if (!candidateId || !voteValue || !userVoted || !position) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await connectToDatabase();

    const contestant = await Contestant.findById(candidateId);
    if (!contestant) return res.status(404).json({ message: 'Contestant not found.' });

    const existingVote = await Vote.findOne({ voter: userVoted, position });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this position.' });
    }

    const percentageVote = calculateVotePercentage(voteValue);

    const newVote = new Vote({ voter: userVoted, contestant: candidateId, position, voteValue, percentage: percentageVote });
    await newVote.save();

    contestant.votes.push(newVote._id);
    await contestant.save();

    res.status(201).json({ message: 'Vote cast successfully.', vote: newVote });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cast vote', error: err.message });
  }
};

const getVotes = async (req, res) => {
  try {
    await connectToDatabase();

    const votes = await Vote.find()
      .populate('voter', 'fullName email')
      .populate('contestant', 'name position');

    res.status(200).json(votes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch votes', error: err.message });
  }
};

const deleteVote = async (req, res) => {
  try {
    const voteId = req.params.id;
    await connectToDatabase();

    const vote = await Vote.findById(voteId);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    await Contestant.findByIdAndUpdate(vote.contestant, { $pull: { votes: vote._id } });
    await vote.deleteOne();

    res.status(200).json({ message: 'Vote deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vote', error: err.message });
  }
};

const getVotePercentagesByCandidateId = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId, candidateId } = req.body;

    if (!userId || !candidateId) {
      return res.status(400).json({ message: 'Both userId and candidateId are required.' });
    }

    const votes = await Vote.find({ voter: userId, contestant: candidateId });

    if (!votes.length) {
      return res.status(404).json({ message: 'No votes found for this user and candidate.' });
    }

    const votePercentages = votes.map(v => ({
      voteId: v._id,
      voteValue: v.voteValue,
      percentage: v.percentage,
      position: v.position,
      createdAt: v.createdAt,
    }));

    res.status(200).json({ votePercentages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vote percentage', error: err.message });
  }
};

// 📈 Get average percentage by user on specific position
const getUserAverageVoteOnPosition = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId, position } = req.body;

    if (!userId || !position) {
      return res.status(400).json({ message: 'userId and position are required.' });
    }

    const votes = await Vote.find({ voter: userId, position });

    if (!votes.length) {
      return res.status(404).json({ message: 'No votes found for this user on this position.' });
    }

    const average = votes.reduce((sum, vote) => sum + vote.percentage, 0) / votes.length;

    res.status(200).json({ averageVotePercentage: average.toFixed(2), voteCount: votes.length });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating average vote', error: err.message });
  }
};

const getAverageVoteByCandidateId = async (req, res) => {
  try {
    await connectToDatabase();
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ message: 'Candidate ID is required.' });
    }

    const votes = await Vote.find({ contestant: candidateId })
      .populate('voter', 'fullName email')
      .populate('contestant', 'name party');

    if (!votes.length) {
      return res.status(404).json({ message: 'No votes found for this candidate.' });
    }

    const totalPercentage = votes.reduce((sum, vote) => sum + (vote.percentage || 0), 0);
    const average = totalPercentage / votes.length;

    res.status(200).json({
      candidateId,
      voteValue: votes.voteValue, 
      position: votes.position,
      averageVote: average.toFixed(2),
      totalVotes: votes.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching votes for candidate', error: err.message });
  }
};








const getUserVote = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId,candidateId} = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId and position are required.' });
    }

    const votes = await Vote.find({ voter: userId, contestant:candidateId });

    if (!votes.length) {
      return res.status(404).json({ message: 'No votes found for this user on this position.' });
    }

console.log(votes);
    res.status(200).json(votes);
  } catch (err) {
    res.status(500).json({ message: 'error at finding uservote', error: err.message });
  }
};

module.exports = {
  castVote,
  getVotes,
  deleteVote,
  getVotePercentagesByCandidateId,
  getUserAverageVoteOnPosition,
  getAverageVoteByCandidateId,getUserVote
};
