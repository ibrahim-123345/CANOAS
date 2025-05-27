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
  FaTimes
} from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const VoterDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userVoted, setUserVoted] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [comments, setComments] = useState({});
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [voteResults, setVoteResults] = useState({});
  const [votedPositions, setVotedPositions] = useState(new Set());
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve', color: '#10B981' },
    { value: 'approve', label: 'Approve', color: '#34D399' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280' },
    { value: 'disapprove', label: 'Disapprove', color: '#F59E0B' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove', color: '#EF4444' }
  ];

  // Mock implementation status data
  const mockImplementationStatus = {
    "Education Reform": [
      { promise: "Build 10 new schools", implemented: true },
      { promise: "Increase teacher salaries by 20%", implemented: false },
      { promise: "Provide free textbooks", implemented: true }
    ],
    "Healthcare Improvement": [
      { promise: "Build 5 new hospitals", implemented: true },
      { promise: "Provide free malaria drugs", implemented: false },
      { promise: "Recruit 1000 new nurses", implemented: true }
    ],
    "Infrastructure Development": [
      { promise: "Repair all major roads", implemented: false },
      { promise: "Build new bridges", implemented: true },
      { promise: "Install street lights in all cities", implemented: false }
    ],
    "Agriculture Support": [
      { promise: "Provide subsidized fertilizers", implemented: true },
      { promise: "Build irrigation systems", implemented: false },
      { promise: "Create farmer markets", implemented: true }
    ]
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (authData) {
      const { user } = authData;
      setUserVoted(user.userId);
      setIsAdmin(user.role === "admin");
      if (user.role !== "admin") {
        fetchNotifications();
      }
    }
    fetchCandidates();
    fetchAllVotes();
  }, []);

  const fetchAllVotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/vote');
      const results = {};
      const userVotedPositions = new Set();
      
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
        
        // Count vote types
        if (vote.voteValue && results[candidateId].voteDistribution[vote.voteValue] !== undefined) {
          results[candidateId].voteDistribution[vote.voteValue] += 1;
        }

        // Track positions the user has voted for
        if (vote.voter._id === userVoted) {
          userVotedPositions.add(vote.position);
        }
      });
      
      // Calculate average for each candidate
      Object.keys(results).forEach(candidateId => {
        results[candidateId].averageApproval = 
          results[candidateId].voteCount > 0 
            ? (results[candidateId].totalPercentage / results[candidateId].voteCount).toFixed(1)
            : 0;
      });
      
      setVoteResults(results);
      setVotedPositions(userVotedPositions);
    } catch (err) {
      console.error('Error fetching all votes:', err);
    }
  };

  const getUserVotePercentage = (candidateId) => {
    if (!voteResults[candidateId]) {
      return { percentage: 0, voteValue: null, message: "You haven't voted for this candidate yet" };
    }

    const userVote = voteResults[candidateId].votes.find(vote => vote.userId === userVoted);
    
    if (!userVote) {
      return { percentage: 0, voteValue: null, message: "You haven't voted for this candidate yet" };
    }

    return { 
      percentage: parseFloat(userVote.percentage || 0),
      voteValue: userVote.voteValue,
      message: `Your approval: ${parseFloat(userVote.percentage || 0)}%`
    };
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/contestants');
      // Add mock implementation data to candidates
      const candidatesWithMockData = response.data.map(candidate => {
        const promisesWithStatus = candidate.promises?.map(promise => {
          const category = candidate.position.split(' ')[0]; // Simple way to match mock data
          const status = mockImplementationStatus[category]?.find(item => 
            item.promise.toLowerCase() === promise.toLowerCase()
          );
          return {
            text: promise,
            implemented: status?.implemented ?? false
          };
        }) || [];
        return { ...candidate, promisesWithStatus };
      });
      setCandidates(candidatesWithMockData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (candidateId, position) => {
    if (!selectedVotes[candidateId]) {
      setError('Please select a vote option');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/vote', {
        candidateId,
        voteValue: selectedVotes[candidateId],
        userVoted,
        position
      });

      await axios.post('http://localhost:8000/comment', {
        contestantId: candidateId,
        comment: comments[candidateId],
        userId: userVoted
      });
      
      setUserVotes(prev => ({
        ...prev,
        [candidateId]: selectedVotes[candidateId]
      }));
      
      // Add position to votedPositions and close all candidates in this position
      setVotedPositions(prev => new Set(prev).add(position));
      setExpandedCandidate(null);
      
      // Refresh data
      fetchCandidates();
      fetchAllVotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assess candidate');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmation = (candidateId, position) => {
    confirmAlert({
      title: 'Confirm Assessment',
      message: 'Are you sure about your assessment?',
      buttons: [
        { label: 'Yes', onClick: () => submitVote(candidateId, position) },
        { label: 'No' }
      ]
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    window.location.href = '/login?logout=true';
    navigate('/');
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

  const getVoteLabel = (voteValue) => {
    const option = voteOptions.find(opt => opt.value === voteValue);
    return option ? option.label : '';
  };

  const getVoteColor = (voteValue) => {
    const option = voteOptions.find(opt => opt.value === voteValue);
    return option ? option.color : '#6B7280';
  };

  const toggleCandidate = (candidateId, position) => {
    if (votedPositions.has(position)) {
      // If user already voted for this position, don't allow toggling
      return;
    }
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  const groupedCandidates = groupCandidatesByPosition();

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="logo">CANOAS</div>
          <nav>
            <Link to="/" className="nav-link">
              <FaHome className="nav-icon" /> 
              <span className="nav-text">Home</span>
            </Link>
            <Link to="/vote" className="nav-link active">
              <FaVoteYea className="nav-icon" /> 
              <span className="nav-text">Assess</span>
            </Link>
            
            {!isAdmin && (
              <div 
                className="nav-link notification-icon"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="nav-icon" /> 
                <span className="nav-text">Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
            )}
            
            {!isAdmin && (
              <Link to="/userDashboard" className="nav-link">
                <FaUserCircle className="nav-icon" /> 
                <span className="nav-text">My Account</span>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/register-contestant" className="nav-link">
                <FaUserCog className="nav-icon" /> 
                <span className="nav-text">Register Contestant</span>
              </Link>
            )}
          </nav>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="logout-icon" /> 
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>Assessor Dashboard</h1>
          <p>Total Registered Candidates: {candidates.length}</p>
          
          {error && <div className="error">{error}</div>}
          {loading && <div className="loading">Loading...</div>}
        </div>

        {showNotifications && (
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="close-btn"
              >
                Close
              </button>
            </div>
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification._id} className="notification-item">
                    <div className={`notification-message ${notification.read ? "read" : "unread"}`}>
                      {notification.message}
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification._id)}
                        className="mark-read-btn"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-notifications">No notifications</div>
              )}
            </div>
          </div>
        )}

        <div className="positions-container">
          {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
            <div key={position} className="position-section">
              <h2 className="position-title">{position}</h2>
              <div className="candidates-grid">
                {positionCandidates.map(candidate => {
                  const voteData = getUserVotePercentage(candidate._id);
                  const hasVoted = voteData.percentage > 0;
                  const averageApproval = voteResults[candidate._id]?.averageApproval || 0;
                  const voteCount = voteResults[candidate._id]?.voteCount || 0;
                  const voteDistribution = voteResults[candidate._id]?.voteDistribution || {};
                  const isExpanded = expandedCandidate === candidate._id;
                  
                  return (
                    <div key={candidate._id} className={`candidate-card ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="candidate-header"
                        onClick={() => toggleCandidate(candidate._id, candidate.position)}
                        style={{ cursor: votedPositions.has(candidate.position) ? 'default' : 'pointer' }}
                      >
                        <img 
                          src={candidate.profileImage || 'https://via.placeholder.com/80'}
                          alt={candidate.name}
                          className="candidate-image"
                        />
                        <div className="candidate-info">
                          <h3>{candidate.name}</h3>
                          <p className="party">{candidate.party}</p>
                          <p className="vote-message">{voteData.message}</p>
                          {hasVoted && (
                            <>
                              <div className="approval-stats">
                                <p className="average-approval">
                                  Average approval: <strong>{averageApproval}%</strong> ({voteCount} votes)
                                </p>
                                <div className="vote-distribution">
                                  {Object.entries(voteDistribution).map(([key, count]) => (
                                    count > 0 && (
                                      <span 
                                        key={key} 
                                        className="vote-distribution-item"
                                        style={{ color: getVoteColor(key) }}
                                      >
                                        {getVoteLabel(key)}: {count}
                                      </span>
                                    )
                                  ))}
                                </div>
                              </div>
                              <p 
                                className="user-vote"
                                style={{ color: getVoteColor(voteData.voteValue) }}
                              >
                                Your assessment: {getVoteLabel(voteData.voteValue)}
                              </p>
                            </>
                          )}
                        </div>
                        {!votedPositions.has(candidate.position) && (
                          <div className="toggle-icon">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        )}
                      </div>

                      <div className="candidate-details">
                        <div className="bio-section">
                          <h4>Bio</h4>
                          <p className="bio-content">{candidate.bio || 'No bio available'}</p>
                        </div>
                        
                        {/* Previous Promises Section */}
                        {candidate.promisesWithStatus?.length > 0 && (
                          <div className="promises-section">
                            <h4>Previous Promises and Implementation Status</h4>
                            <div className="promises-status-container">
                              <div className="implemented-promises">
                                <h5>Implemented</h5>
                                <ul className="promises-list">
                                  {candidate.promisesWithStatus
                                    .filter(promise => promise.implemented)
                                    .map((promise, i) => (
                                      <li key={`implemented-${i}`} className="promise-item">
                                        <span className="promise-text">{promise.text}</span>
                                        <span className="status-badge implemented">
                                          <FaCheck className="status-icon" /> Implemented
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                              <div className="not-implemented-promises">
                                <h5>Not Implemented</h5>
                                <ul className="promises-list">
                                  {candidate.promisesWithStatus
                                    .filter(promise => !promise.implemented)
                                    .map((promise, i) => (
                                      <li key={`not-implemented-${i}`} className="promise-item">
                                        <span className="promise-text">{promise.text}</span>
                                        <span className="status-badge not-implemented">
                                          <FaTimes className="status-icon" /> Not Implemented
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Current Promises Section */}
                        {candidate.currentPromises?.length > 0 && (
                          <div className="current-promises-section">
                            <h4>Current Promises</h4>
                            <ul className="promises-list">
                              {candidate.currentPromises.map((promise, i) => (
                                <li key={`current-${i}`} className="promise-item current">
                                  <span className="promise-text">{promise}</span>
                                  <span className="status-badge pending">
                                    Pending
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!hasVoted && (isExpanded || votedPositions.has(candidate.position)) && (
                          <div className="vote-section">
                            <div className="vote-options">
                              <label htmlFor={`vote-select-${candidate._id}`}>Select assessment:</label>
                              <select
                                id={`vote-select-${candidate._id}`}
                                value={selectedVotes[candidate._id] || ''}
                                onChange={(e) => setSelectedVotes(prev => ({
                                  ...prev,
                                  [candidate._id]: e.target.value
                                }))}
                              >
                                <option value="">Choose an option</option>
                                {voteOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="comment-section">
                              <label htmlFor={`comment-${candidate._id}`}>Comments (optional):</label>
                              <textarea
                                id={`comment-${candidate._id}`}
                                placeholder="Add your comments here..."
                                value={comments[candidate._id] || ''}
                                onChange={(e) => setComments(prev => ({
                                  ...prev,
                                  [candidate._id]: e.target.value
                                }))}
                                rows="3"
                              />
                            </div>

                            <button
                              onClick={() => showConfirmation(candidate._id, candidate.position)}
                              disabled={!selectedVotes[candidate._id] || loading}
                              className="submit-btn"
                            >
                              {loading ? 'Submitting...' : 'Submit Assessment'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
        }
        
        .sidebar {
          width: 250px;
          background: #2c3e50;
          color: white;
          position: fixed;
          height: 100%;
          overflow-y: auto;
          z-index: 100;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px 0;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 30px;
          color: #ecf0f1;
          padding: 0 20px;
          text-align: center;
        }
        
        nav {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          padding: 0 15px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #bdc3c7;
          text-decoration: none;
          padding: 12px 15px;
          margin-bottom: 5px;
          border-radius: 4px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .nav-link:hover, .nav-link.active {
          background: #34495e;
          color: #ecf0f1;
        }

        .nav-icon {
          font-size: 1.1rem;
          min-width: 24px;
        }

        .nav-text {
          white-space: nowrap;
        }
        
        .notification-icon {
          position: relative;
          cursor: pointer;
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.7rem;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          color: #bdc3c7;
          border: none;
          padding: 12px 15px;
          margin: 20px 15px 0;
          cursor: pointer;
          width: calc(100% - 30px);
          border-radius: 4px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          text-align: left;
        }
        
        .logout-btn:hover {
          background: #34495e;
          color: #ecf0f1;
        }

        .logout-icon {
          font-size: 1.1rem;
          min-width: 24px;
        }
        
        .main-content {
          flex: 1;
          padding: 20px;
          margin-left: 250px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .content-header {
          margin-bottom: 30px;
        }
        
        .content-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 1.8rem;
        }
        
        .error {
          color: #e74c3c;
          margin: 15px 0;
          padding: 12px;
          background: #fadbd8;
          border-radius: 4px;
          border-left: 4px solid #e74c3c;
        }
        
        .loading {
          padding: 15px;
          background: #f0f0f0;
          border-radius: 4px;
          text-align: center;
          color: #7f8c8d;
        }
        
        .positions-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .position-section {
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .position-title {
          color: #2c3e50;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          font-size: 1.4rem;
        }
        
        .candidates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }
        
        .candidate-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .candidate-card.expanded {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .candidate-header {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }
        
        .candidate-image {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eee;
          flex-shrink: 0;
        }
        
        .candidate-info {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        
        .candidate-info h3 {
          margin: 0 0 5px 0;
          color: #2c3e50;
          font-size: 1.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .party {
          margin: 3px 0;
          font-size: 0.85rem;
          color: #7f8c8d;
          font-weight: 500;
        }

        .vote-message, 
        .average-approval,
        .user-vote {
          margin: 3px 0;
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .user-vote {
          font-weight: 600;
        }

        .approval-stats {
          margin: 8px 0;
        }

        .vote-distribution {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 5px;
        }

        .vote-distribution-item {
          font-size: 0.75rem;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .toggle-icon {
          color: #95a5a6;
          margin-left: 10px;
          flex-shrink: 0;
          padding-top: 3px;
        }
        
        .candidate-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .bio-section,
        .promises-section,
        .current-promises-section {
          margin-bottom: 15px;
        }
        
        .candidate-details h4 {
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 1rem;
        }

        .candidate-details h5 {
          color: #4b5563;
          margin: 8px 0;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .bio-content {
          margin: 0 0 10px 0;
          color: #34495e;
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .promises-status-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .implemented-promises,
        .not-implemented-promises {
          flex: 1;
        }
        
        .promises-list {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .promise-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .promise-item.current {
          background: #f0f9ff;
        }
        
        .promise-text {
          flex: 1;
          color: #34495e;
          margin-right: 10px;
          word-break: break-word;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .status-badge.implemented {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-badge.not-implemented {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .status-badge.pending {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .status-icon {
          margin-right: 4px;
          font-size: 0.7rem;
        }
        
        .vote-section {
          margin-top: 15px;
        }

        .vote-options,
        .comment-section {
          margin-bottom: 15px;
        }
        
        .vote-section label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.9rem;
          color: #2c3e50;
          font-weight: 500;
        }
        
        .vote-section select, 
        .vote-section textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .vote-section select {
          background-color: white;
          cursor: pointer;
        }
        
        .vote-section textarea {
          min-height: 80px;
          resize: vertical;
        }
        
        .vote-section select:focus, 
        .vote-section textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #2c3e50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
          font-size: 0.95rem;
        }
        
        .submit-btn:hover {
          background: #34495e;
        }
        
        .submit-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }
        
        .notification-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 350px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 15px rgba(0,0,0,0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          background: #2c3e50;
          color: white;
        }
        
        .notification-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }
        
        .close-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        
        .notification-list {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }
        
        .notification-item {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        
        .notification-message {
          margin-bottom: 8px;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .unread {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .read {
          color: #7f8c8d;
        }
        
        .mark-read-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .no-notifications {
          text-align: center;
          color: #7f8c8d;
          padding: 20px 0;
        }

        @media (max-width: 992px) {
          .sidebar {
            width: 220px;
          }
          
          .main-content {
            margin-left: 220px;
          }
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
            padding: 15px;
          }
          
          .candidates-grid {
            grid-template-columns: 1fr;
          }
          
          .notification-panel {
            width: 100%;
          }

          .promises-status-container {
            flex-direction: column;
          }
        }

        @media (max-width: 576px) {
          .content-header h1 {
            font-size: 1.5rem;
          }
          
          .position-title {
            font-size: 1.2rem;
          }
          
          .candidate-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .candidate-info {
            width: 100%;
            text-align: center;
          }
          
          .toggle-icon {
            display: none;
          }

          .vote-distribution {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default VoterDashboard;