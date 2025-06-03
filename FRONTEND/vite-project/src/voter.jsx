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
  FaComments
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
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [candidateComments, setCandidateComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve', color: '#10B981' },
    { value: 'approve', label: 'Approve', color: '#34D399' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280' },
    { value: 'disapprove', label: 'Disapprove', color: '#F59E0B' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove', color: '#EF4444' }
  ];

  const fetchComments = async (contestantId) => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:8000/comments/${contestantId}`);
      setCandidateComments(response.data);
      setShowCommentsModal(true);
    } catch (err) {
      setError('Failed to fetch comments');
    } finally {
      setLoadingComments(false);
    }
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
        
        if (vote.voteValue && results[candidateId].voteDistribution[vote.voteValue] !== undefined) {
          results[candidateId].voteDistribution[vote.voteValue] += 1;
        }

        if (vote.voter._id === userVoted) {
          userVotedPositions.add(vote.position);
        }
      });
      
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
      setCandidates(response.data);
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
      
      setVotedPositions(prev => new Set(prev).add(position));
      setExpandedCandidate(null);
      
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
    navigate('/login');
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
    if (votedPositions.has(position)) return;
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  const formatPreviousPosition = (candidate) => {
    if (candidate.previousPosition && candidate.timeServed) {
      const prevData= {
        position: candidate.previousPosition,
        time: candidate.timeServed
      }

    
      return prevData;
    }
    return null;
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
              <span>Home</span>
            </Link>
            <Link to="/vote" className="nav-link active">
              <FaVoteYea className="nav-icon" /> 
              <span>Assess</span>
            </Link>
            <Link to="/generalAnalysis" className="nav-link">
              <FaChartBar className="nav-icon" /> 
              <span>General Analysis</span>
            </Link>
            
            {!isAdmin && (
              <div 
                className="nav-link notification-icon"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="nav-icon" /> 
                <span>Notifications</span>
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
                <span>My Account</span>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/register-contestant" className="nav-link">
                <FaUserCog className="nav-icon" /> 
                <span>Register Contestant</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>Assessor Dashboard</h1>
          <p>Total Registered Candidates: {candidates.length}</p>
          
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="logout-icon" /> 
            <span>Logout</span>
          </button>
          
          {error && <div className="error">{error}</div>}
          {loading && <div className="loading">Loading...</div>}
        </div>

        {showNotifications && (
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>Close</button>
            </div>
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification._id} className="notification-item">
                    <div className={`notification-message ${notification.read ? "read" : "unread"}`}>
                      {notification.message}
                    </div>
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification._id)}>
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

        {showCommentsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Comments</h3>
                <button onClick={() => setShowCommentsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {loadingComments ? (
                  <div className="loading">Loading comments...</div>
                ) : candidateComments.length > 0 ? (
                  <div className="comments-list">
                    {candidateComments.map((comment, index) => (
                      <div key={index} className="comment-item">
                        <div className="comment-user">{comment.userId?.name || 'Anonymous'}</div>
                        <div className="comment-text">{comment.content}</div>
                        <div className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comments">No comments yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="positions-container">
          {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
            <div key={position} className="position-section">
              <h2>{position}</h2>
              <div className="candidates-grid">
                {positionCandidates.map(candidate => {
                  const voteData = getUserVotePercentage(candidate._id);
                  const hasVoted = voteData.percentage > 0;
                  const averageApproval = voteResults[candidate._id]?.averageApproval || 0;
                  const voteCount = voteResults[candidate._id]?.voteCount || 0;
                  const voteDistribution = voteResults[candidate._id]?.voteDistribution || {};
                  const isExpanded = expandedCandidate === candidate._id;
                  const formattedPreviousPosition = formatPreviousPosition(candidate);
                  //console.log(formattedPreviousPosition.time);
                  
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
                          {formattedPreviousPosition && (
                            <p className="previous-position">Previously: {formattedPreviousPosition.position} ({formattedPreviousPosition.time})</p>
                          )}
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
                                        style={{ color: getVoteColor(key) }}
                                      >
                                        {getVoteLabel(key)}: {count}
                                      </span>
                                    )
                                  ))}
                                </div>
                              </div>
                              <p style={{ color: getVoteColor(voteData.voteValue) }}>
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
                          <p>{candidate.bio || 'No bio available'}</p>
                        </div>
                        
                        {candidate.previousPromises && candidate.previousPromises.length > 0 && (
                          <div className="promises-section">
                            <h4>Previous Promises & Performance</h4>
                            <div className="promises-status-container">
                              <div className="implemented-promises">
                                <h5>Fulfilled Promises</h5>
                                <ul>
                                  {candidate.previousPromises
                                    ?.filter(promise => promise.fulfilled)
                                    .map((promise, i) => (
                                      <li key={`fulfilled-${i}`} className="promise-item">
                                        <span>{promise.promise || promise.text}</span>
                                        <span className="status-badge implemented">
                                          <FaCheck /> Implemented
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                              <div className="not-implemented-promises">
                                <h5>Unfulfilled Promises</h5>
                                <ul>
                                  {candidate.previousPromises
                                    ?.filter(promise => !promise.fulfilled)
                                    .map((promise, i) => (
                                      <li key={`unfulfilled-${i}`} className="promise-item">
                                        <span>{promise.promise || promise.text}</span>
                                        <span className="status-badge not-implemented">
                                          <FaTimes /> Not Implemented
                                        </span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="current-promises">
                          <h4>Current Campaign Promises</h4>
                          <ul className="promises-list">
                            {candidate.promises?.map((promise, i) => (
                              <li key={`current-${i}`}>
                                <span className="promise-bullet">•</span>
                                <span className="promise-text">{promise}</span>
                              </li>
                            ))}
                          </ul>
                          <button 
                            className="view-comments-btn"
                            onClick={() => fetchComments(candidate._id)}
                          >
                            <FaComments /> View Comments
                          </button>
                        </div>

                        {!hasVoted && (isExpanded || votedPositions.has(candidate.position)) && (
                          <div className="vote-section">
                            <div className="vote-options">
                              <label>Select assessment:</label>
                              <select
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
                              <label>Comments (optional):</label>
                              <textarea
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

        .notification-badge {
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.7rem;
          margin-left: auto;
        }

        .main-content {
          flex: 1;
          padding: 20px;
          margin-left: 250px;
          max-width: 1200px;
        }

        .content-header {
          margin-bottom: 30px;
          position: relative;
        }
        
        .logout-btn {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .error {
          color: #e74c3c;
          margin: 15px 0;
          padding: 12px;
          background: #fadbd8;
          border-radius: 4px;
        }
        
        .positions-container {
          margin-top: 20px;
        }
        
        .position-section {
          margin-bottom: 40px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .candidates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }
        
        .candidate-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: white;
          display: flex;
          flex-direction: column;
          height: auto;
          transition: all 0.3s ease;
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
        }
        
        .candidate-info h3 {
          margin: 0;
          font-size: 1.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .party, .previous-position {
          color: #7f8c8d;
          font-size: 0.85rem;
          margin: 3px 0;
        }

        .vote-message, .average-approval {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin: 5px 0;
        }

        .vote-distribution {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin: 5px 0;
          font-size: 0.75rem;
        }
        
        .candidate-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          flex: 1;
          overflow: hidden;
        }

        .candidate-details h4 {
          margin: 10px 0 5px;
          font-size: 0.95rem;
          color: #2c3e50;
        }

        .candidate-details p, 
        .candidate-details ul {
          margin: 0 0 10px;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .promises-status-container {
          display: flex;
          gap: 15px;
          margin: 10px 0;
        }

        .implemented-promises,
        .not-implemented-promises {
          flex: 1;
          min-width: 0;
        }
        
        .promises-section h5 {
          font-size: 0.9rem;
          margin: 10px 0 5px;
          color: #2c3e50;
        }
        
        .promises-section ul,
        .current-promises ul {
          list-style: none;
          padding: 0;
          margin: 10px 0;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .promise-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.8rem;
          word-break: break-word;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          white-space: nowrap;
        }
        
        .implemented {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .not-implemented {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .current-promises {
          margin-top: 15px;
        }

        .promises-list li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .promise-bullet {
          color: #3b82f6;
          margin-right: 10px;
          font-weight: bold;
        }

        .view-comments-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0f4f8;
          color: #3b82f6;
          border: 1px solid #dbeafe;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 10px;
        }

        .vote-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .vote-section label {
          display: block;
          margin: 10px 0 5px;
          font-size: 0.9rem;
        }
        
        .vote-section select, 
        .vote-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 0.85rem;
        }
        
        .vote-section button {
          width: 100%;
          padding: 12px;
          background: #2c3e50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .vote-section button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }
        
        .toggle-icon {
          margin-left: 10px;
          color: #7f8c8d;
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
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-bottom: 1px solid #eee;
          background: #2c3e50;
          color: white;
        }
        
        .notification-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }
        
        .notification-list {
          padding: 15px;
          overflow-y: auto;
          height: calc(100% - 60px);
        }
        
        .notification-item {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        
        .unread {
          font-weight: 600;
        }
        
        .read {
          color: #7f8c8d;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .comment-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .comment-user {
          font-weight: bold;
          margin-bottom: 5px;
          color: #2c3e50;
        }

        .comment-text {
          margin-bottom: 5px;
          line-height: 1.4;
        }

        .comment-date {
          font-size: 0.8rem;
          color: #7f8c8d;
          text-align: right;
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
            gap: 15px;
          }
          
          .notification-panel {
            width: 100%;
          }

          .promises-status-container {
            flex-direction: column;
            gap: 10px;
          }

          .modal-content {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default VoterDashboard;