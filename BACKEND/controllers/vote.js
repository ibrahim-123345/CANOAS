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
    console.log(position);

    // Ensure all required fields are provided
    if (!candidateId || !voteValue || !userVoted || !position) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await connectToDatabase();

    // Verify contestant exists
    const contestant = await Contestant.findById(candidateId);
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found.' });
    }

    // Prevent multiple votes per position by same user
    const existingVote = await Vote.findOne({
      voter: userVoted,
      position: position,
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this position.' });
    }

    // Calculate percentage
    const percentageVote = calculateVotePercentage(voteValue);

    // Create new vote
    const newVote = new Vote({
      voter: userVoted,
      contestant: candidateId,
      position,
      voteValue,
      percentage: percentageVote,
    });

    await newVote.save();

    // Link vote to contestant
    contestant.votes.push(newVote._id);
    await contestant.save();

    res.status(201).json({ message: 'Vote cast successfully.', vote: newVote });
  } catch (err) {
    console.error('Error casting vote:', err);
    res.status(500).json({ message: 'Failed to cast vote', error: err.message });
  }
};

const getVotes = async (req, res) => {
  try {
    await connectToDatabase();

    const votes = await Vote.find()
      .populate('voter', 'username email')
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
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // Remove vote from contestant's vote list
    await Contestant.findByIdAndUpdate(vote.contestant, {
      $pull: { votes: vote._id },
    });

    await vote.deleteOne();
    res.status(200).json({ message: 'Vote deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vote', error: err.message });
  }
};



const getVotePercentagesByCandidateId = async (req, res) => {
  try {
    await connectToDatabase();

    const {userId} = req.body; 
    console.log(req.body);

    if (!userId) {
      return res.status(400).json({ message: 'candidateId and userId are required.' });
    }

    const vote = await Vote.find({  voter: userId });
    console.log(vote);

    if (!vote) {
      return res.status(404).json({ message: 'Vote not found for this user and candidate.' });
    }
    //console.log(vote.percentage);

    res.status(200).json({votePercentage: vote });
  } catch (err) {
    console.error('Error fetching vote percentage:', err);
    res.status(500).json({ message: 'Failed to fetch vote percentage', error: err.message });
  }
};


module.exports = {
  castVote,
  getVotes,
  deleteVote,
  getVotePercentagesByCandidateId
};
