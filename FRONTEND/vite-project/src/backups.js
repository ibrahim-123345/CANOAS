
  const getVoteResults = async () => {
    try {
      const response = await axios.get('http://localhost:8000/vote');
      const results = {};
      response.data.forEach(vote => {
        if (!vote.contestant) return;
        const candidateId = vote.contestant._id;
        
        if (!results[candidateId]) {
          results[candidateId] = {
            candidateName: vote.contestant.name || "Unknown",
            votes: []
          };
        }

        results[candidateId].votes.push({
          percentage: vote.percentage,
          voteValue: vote.voteValue
        });
      });
      setVoteResults(results);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const getVotePercentage = (candidateId) => {
    if (!voteResults[candidateId] || voteResults[candidateId].votes.length === 0) return 0;
    const latestVote = voteResults[candidateId].votes[voteResults[candidateId].votes.length - 1];
    return parseFloat(latestVote.percentage || 0);
  };
const fetchUserVotes = async (userId) => {
    try {
      const response = await axios.post('http://localhost:8000/getVotePercentage', { userId });
      const votes = response.data.reduce((acc, vote) => {
        acc[vote.candidateId] = vote.voteValue;
        return acc;
      }, {});
      setUserVotes(votes);
    } catch (err) {
      console.error('Error fetching user votes:', err);
    }
  };




   const getVotePercentage = async (userId, candidateId) => {
    try {
      const response = await axios.post('http://localhost:8000/getUserVote', { userId, candidateId });
      const [{ voteId, voteValue, percentage, position, createdAt }] = response.data.votePercentages;
  
      return percentage;
    } catch (error) {
      console.error('Error fetching vote percentage:', error.message);
      throw error; 
    }
  };