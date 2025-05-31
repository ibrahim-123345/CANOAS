import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaVoteYea, 
  FaChartBar, 
  FaUserCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes,
  FaChartLine
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [voteResults, setVoteResults] = useState({});
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve', color: '#10B981' },
    { value: 'approve', label: 'Approve', color: '#34D399' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280' },
    { value: 'disapprove', label: 'Disapprove', color: '#F59E0B' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove', color: '#EF4444' }
  ];

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (authData) {
      setUserData(authData.user);
    }
    fetchCandidates();
    fetchAllVotes();
  }, []);

  const fetchAllVotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/vote');
      const results = {};
      const userVotesList = [];
      
      response.data.forEach(vote => {
        if (!vote.contestant) return;
        const candidateId = vote.contestant._id;
        
        if (!results[candidateId]) {
          results[candidateId] = {
            candidateName: vote.contestant.name || "Unknown",
            votes: [],
            totalPercentage: 0,
            voteCount: 0,
            position: vote.position,
            voteDistribution: {
              strong_approve: 0,
              approve: 0,
              neutral: 0,
              disapprove: 0,
              strong_disapprove: 0
            }
          };
        }

        results[candidateId].votes.push({
          userId: vote.voter._id,
          percentage: vote.percentage,
          voteValue: vote.voteValue
        });
        
        results[candidateId].totalPercentage += parseFloat(vote.percentage || 0);
        results[candidateId].voteCount += 1;
        
        if (vote.voteValue && results[candidateId].voteDistribution[vote.voteValue] !== undefined) {
          results[candidateId].voteDistribution[vote.voteValue] += 1;
        }

        if (vote.voter._id === userData?.userId) {
          userVotesList.push({
            candidateId,
            candidateName: vote.contestant.name,
            position: vote.position,
            voteValue: vote.voteValue,
            percentage: vote.percentage
          });
        }
      });
      
      Object.keys(results).forEach(candidateId => {
        results[candidateId].averageApproval = 
          results[candidateId].voteCount > 0 
            ? (results[candidateId].totalPercentage / results[candidateId].voteCount).toFixed(1)
            : 0;
      });
      
      setVoteResults(results);
      setUserVotes(userVotesList);
    } catch (err) {
      console.error('Error fetching all votes:', err);
      setError('Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/contestants');
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
    }
  };

  const groupCandidatesByPosition = () => {
    const grouped = {};
    candidates.forEach(candidate => {
      if (!grouped[candidate.position]) {
        grouped[candidate.position] = [];
      }
      grouped[candidate.position].push(candidate);
    });
    return grouped;
  };

  const getVoteColor = (percentage) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#34D399';
    if (percentage >= 40) return '#6B7280';
    if (percentage >= 20) return '#F59E0B';
    return '#EF4444';
  };

  const getVoteLabel = (voteValue) => {
    const option = voteOptions.find(opt => opt.value === voteValue);
    return option ? option.label : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    navigate('/login');
  };

  const togglePosition = (position) => {
    setExpandedPosition(expandedPosition === position ? null : position);
  };

  const groupedCandidates = groupCandidatesByPosition();

  const prepareUserChartData = (position) => {
    const positionVotes = userVotes.filter(vote => vote.position === position);
    if (positionVotes.length === 0) return null;

    const labels = positionVotes.map(vote => vote.candidateName);
    const data = positionVotes.map(vote => parseFloat(vote.percentage || 0));
    const backgroundColors = positionVotes.map(vote => getVoteColor(parseFloat(vote.percentage || 0)));

    return {
      labels,
      datasets: [{
        label: 'Your Approval Rating (%)',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const vote = userVotes.find(v => v.candidateName === context.label);
            return `${context.parsed.y}% (${getVoteLabel(vote?.voteValue)})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Approval Rating (%)'
        }
      }
    }
  };

  const getTopPerformers = () => {
    const topPerformers = [];
    Object.entries(groupedCandidates).forEach(([position, positionCandidates]) => {
      const candidatesWithStats = positionCandidates.map(candidate => ({
        ...candidate,
        averageApproval: parseFloat(voteResults[candidate._id]?.averageApproval || 0),
        voteCount: voteResults[candidate._id]?.voteCount || 0
      }));

      const topCandidate = candidatesWithStats.sort((a, b) => b.averageApproval - a.averageApproval)[0];
      if (topCandidate) {
        topPerformers.push({
          position,
          name: topCandidate.name,
          party: topCandidate.party,
          approval: topCandidate.averageApproval,
          votes: topCandidate.voteCount
        });
      }
    });

    return topPerformers;
  };

  const getUserVoteForCandidate = (candidateId) => {
    return userVotes.find(vote => vote.candidateId === candidateId);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="sidebar">
          {/* Sidebar content */}
        </div>
        <div className="main-content">
          <div className="loading">Loading your data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="sidebar">
          {/* Sidebar content */}
        </div>
        <div className="main-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="logo">CANOAS</div>
          <nav>
            <Link to="/" className="nav-link">
              <FaHome className="nav-icon" /> 
              <span>Home</span>
            </Link>
            <Link to="/vote" className="nav-link">
              <FaVoteYea className="nav-icon" /> 
              <span>Assess</span>
            </Link>
            <Link to="/generalAnalysis" className="nav-link">
              <FaChartBar className="nav-icon" /> 
              <span>General Analysis</span>
            </Link>
            <Link to="/userDashboard" className="nav-link active">
              <FaUserCircle className="nav-icon" /> 
              <span>My Account</span>
            </Link>
          </nav>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="logout-icon" /> 
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>My Account</h1>
          
          <div className="user-profile">
            <div className="profile-header">
              <img 
                src={userData?.profileImage || 'https://via.placeholder.com/100?text=USER'} 
                alt="User profile"
                className="profile-image"
              />
              <div className="profile-info">
                <h2>{userData?.name || 'User'}</h2>
                <p className="email">{userData?.email}</p>
                <p className="role">Voter since {new Date(userData?.createdAt).getFullYear()}</p>
              </div>
            </div>
            
            <div className="stats-summary">
              <div className="stat-item">
                <FaVoteYea className="stat-icon" />
                <div>
                  <h3>{userVotes.length}</h3>
                  <p>Total Assessments</p>
                </div>
              </div>
              <div className="stat-item">
                <FaChartLine className="stat-icon" />
                <div>
                  <h3>{
                    userVotes.length > 0 
                      ? (userVotes.reduce((sum, vote) => sum + parseFloat(vote.percentage || 0), 0) / userVotes.length)
                      : 0 
                  }%</h3>
                  <p>Average Approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="top-performers-section">
          <h2>Top Performers by Position</h2>
          <div className="top-performers-table">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Candidate</th>
                  <th>Party</th>
                  <th>Approval</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {getTopPerformers().map((performer, index) => (
                  <tr key={index}>
                    <td>{performer.position}</td>
                    <td>
                      <div className="candidate-info">
                        <img 
                          src={candidates.find(c => c.name === performer.name)?.profileImage || 'https://via.placeholder.com/40'} 
                          alt={performer.name}
                          className="candidate-image"
                        />
                        {performer.name}
                      </div>
                    </td>
                    <td>{performer.party}</td>
                    <td style={{ color: getVoteColor(performer.approval) }}>
                      {performer.approval}%
                    </td>
                    <td>{performer.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="positions-analysis">
          <h2>Your Assessments by Position</h2>
          
          {Object.entries(groupedCandidates).map(([position, positionCandidates]) => {
            const positionVotes = userVotes.filter(vote => vote.position === position);
            if (positionVotes.length === 0) return null;

            return (
              <div key={position} className="position-section">
                <div 
                  className="position-header"
                  onClick={() => togglePosition(position)}
                >
                  <h3>{position}</h3>
                  <div className="toggle-icon">
                    {expandedPosition === position ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                
                {expandedPosition === position && (
                  <div className="position-content">
                    <div className="chart-container">
                      <Bar data={prepareUserChartData(position)} options={chartOptions} />
                    </div>
                    
                    <div className="candidates-list">
                      {positionCandidates.map(candidate => {
                        const userVote = getUserVoteForCandidate(candidate._id);
                        if (!userVote) return null;

                        return (
                          <div key={candidate._id} className="candidate-card">
                            <div className="candidate-header">
                              <img 
                                src={candidate.profileImage || 'https://via.placeholder.com/60'} 
                                alt={candidate.name}
                                className="candidate-image"
                              />
                              <div className="candidate-info">
                                <h4>{candidate.name}</h4>
                                <p className="party">{candidate.party}</p>
                                <div className="vote-details">
                                  <span className="approval" style={{ color: getVoteColor(userVote.percentage) }}>
                                    {userVote.percentage}% approval
                                  </span>
                                  <span className="vote-value" style={{ color: getVoteColor(userVote.percentage) }}>
                                    ({getVoteLabel(userVote.voteValue)})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .sidebar {
          width: 250px;
          background: #2c3e50;
          color: white;
          position: fixed;
          height: 100%;
        }

        .sidebar-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
        }
        
        nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex-grow: 1;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #bdc3c7;
          text-decoration: none;
          padding: 12px;
          border-radius: 4px;
        }
        
        .nav-link:hover, .nav-link.active {
          background: #34495e;
          color: white;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          color: #bdc3c7;
          border: none;
          padding: 12px;
          cursor: pointer;
          margin-top: auto;
        }
        
        .logout-btn:hover {
          color: white;
        }

        .main-content {
          flex: 1;
          padding: 30px;
          margin-left: 250px;
          max-width: 1200px;
        }

        .content-header {
          margin-bottom: 30px;
        }
        
        .content-header h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .user-profile {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 20px;
          border: 3px solid #eee;
        }

        .profile-info h2 {
          margin: 0 0 5px;
          color: #2c3e50;
        }

        .profile-info .email {
          color: #7f8c8d;
          margin: 0 0 5px;
        }

        .profile-info .role {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin: 0;
        }

        .stats-summary {
          display: flex;
          gap: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          flex: 1;
        }

        .stat-icon {
          font-size: 1.5rem;
          color: #3498db;
        }

        .stat-item h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #2c3e50;
        }

        .stat-item p {
          margin: 5px 0 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .top-performers-section {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .top-performers-section h2 {
          margin-top: 0;
          color: #2c3e50;
        }

        .top-performers-table {
          margin-top: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        tr:hover {
          background-color: #f8f9fa;
        }

        .candidate-info {
          display: flex;
          align-items: center;
        }

        .candidate-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 10px;
          border: 1px solid #eee;
        }

        .positions-analysis {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .positions-analysis h2 {
          margin-top: 0;
          color: #2c3e50;
        }

        .position-section {
          margin-bottom: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }

        .position-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background-color: #f8f9fa;
          cursor: pointer;
        }

        .position-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .toggle-icon {
          color: #7f8c8d;
        }

        .position-content {
          padding: 20px;
        }

        .chart-container {
          height: 300px;
          margin-bottom: 30px;
        }

        .candidates-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .candidate-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
        }

        .candidate-header {
          display: flex;
          align-items: center;
        }

        .candidate-card .candidate-image {
          width: 60px;
          height: 60px;
          margin-right: 15px;
        }

        .candidate-card h4 {
          margin: 0 0 5px;
          font-size: 1.1rem;
          color: #2c3e50;
        }

        .candidate-card .party {
          color: #7f8c8d;
          font-size: 0.85rem;
          margin: 0 0 5px;
        }

        .vote-details {
          font-size: 0.9rem;
        }

        .vote-details .vote-value {
          margin-left: 5px;
          font-style: italic;
        }

        .loading, .error {
          padding: 20px;
          text-align: center;
          font-size: 1.1rem;
        }
        
        .error {
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .dashboard {
            flex-direction: column;
          }
          
          .sidebar {
            position: relative;
            width: 100%;
            height: auto;
          }
          
          .main-content {
            margin-left: 0;
            padding: 20px;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .profile-image {
            margin-right: 0;
            margin-bottom: 15px;
          }

          .stats-summary {
            flex-direction: column;
          }

          .candidates-list {
            grid-template-columns: 1fr;
          }

          .top-performers-table {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;