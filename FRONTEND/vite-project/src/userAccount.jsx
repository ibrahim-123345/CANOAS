import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaVoteYea, 
  FaChartBar, 
  FaSun, 
  FaMoon, 
  FaSignOutAlt,
  FaBell,
  FaTimes,
  FaExclamationTriangle,
  FaUserCircle,
  FaCheck,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const UserDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [voteResults, setVoteResults] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userVoted, setUserVoted] = useState();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    role: ''
  });
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (authData) {
      try {
        const { user } = authData;
        setUserVoted(user.userId);
        setEditedProfile({
          name: user.username || '',
          email: user.email || '',
          role: user.role || ''
        });
        fetchNotifications();
      } catch (e) {
        console.error('Error parsing user data:', e);
        setApiErrors(prev => ({
          ...prev,
          userData: 'Failed to parse user data from localStorage'
        }));
      }
    }
    
    fetchCandidates();
    getVoteResults();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/notifications');
      setNotifications(response.data);
      setApiErrors(prev => ({ ...prev, notifications: null }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setApiErrors(prev => ({
        ...prev,
        notifications: err.response?.data?.message || 'Failed to load notifications'
      }));
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/notifications/${id}/read`);
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
      setApiErrors(prev => ({ ...prev, markRead: null }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setApiErrors(prev => ({
        ...prev,
        markRead: err.response?.data?.message || 'Failed to mark notification as read'
      }));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/notifications/${id}`);
      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setApiErrors(prev => ({
        ...prev,
        deleteNotification: err.response?.data?.message || 'Failed to delete notification'
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    window.location.reload();
    navigate('/');
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/contestants');
      setCandidates(response.data);
      setApiErrors(prev => ({ ...prev, candidates: null }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch candidates. Please try again later.';
      setError(errorMsg);
      setApiErrors(prev => ({
        ...prev,
        candidates: errorMsg
      }));
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVoteResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8000/vote');
      const results = {};

      response.data.forEach(vote => {
        if (!vote.contestant) return;

        const candidateId = vote.contestant._id;

        
        if (!results[candidateId]) {
          results[candidateId] = {
            candidateName: vote.contestant.name || "Unknown",
            position: vote.contestant.position || "Unknown",
            votes: []
          };
        }

        results[candidateId].votes.push({
          percentage: vote.percentage,
          voteValue: vote.voteValue,
          voterId: vote.voter._id,
          voterName: vote.voter.email || "Unknown"
        });
      });


      setVoteResults(results);
      setApiErrors(prev => ({ ...prev, voteResults: null }));

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Could not load vote results. Please try again later.';
      setError(errorMsg);
      setApiErrors(prev => ({ ...prev, voteResults: errorMsg }));
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVotePercentage = (candidateId) => {
    if (!voteResults[candidateId] || voteResults[candidateId].votes.length === 0) return 0;
    const latestVote = voteResults[candidateId].votes[voteResults[candidateId].votes.length - 1];
    return parseFloat(latestVote.percentage || 0);
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const groupedCandidates = groupCandidatesByPosition();
  const authData = JSON.parse(localStorage.getItem('authData'));
  const user = authData?.user;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1a1b1e' : '#f8fafc',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '250px',
        backgroundColor: darkMode ? '#0f172a' : '#1e40af',
        color: 'white',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '30px' }}>
            CANOAS
          </div>
          <nav style={{ flex: 1 }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'white',
              textDecoration: 'none',
              padding: '10px',
              marginBottom: '5px',
              borderRadius: '5px',
            }}>
              <FaHome size={20} />
              Home
            </Link>
            <Link to="/vote" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'white',
              textDecoration: 'none',
              padding: '10px',
              marginBottom: '5px',
              borderRadius: '5px',
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}>
              <FaVoteYea size={20} />
              Assess
            </Link>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'white',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}>
                  {notifications.filter(n => !n.read).length}
                </div>
              )}
              Notifications
            </div>
          </nav>
        </div>
        
        <div>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{
              padding: '10px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              marginBottom: '10px',
            }}
          >
            {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'white',
            padding: '10px',
            width: '100%',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
          }}>
            <FaSignOutAlt size={20} />
            Logout
          </button>
        </div>
      </div>

      <div style={{
        flexGrow: 1,
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: darkMode ? '#f8fafc' : '#1e293b',
          }}>User Dashboard</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{
              padding: '10px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {Object.keys(apiErrors).filter(key => apiErrors[key]).length > 0 && (
          <div style={{
            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderLeft: '4px solid #ef4444',
            padding: '15px',
            margin: '15px 0',
            borderRadius: '0 5px 5px 0',
          }}>
            <h3 style={{
              fontWeight: '600',
              color: '#ef4444',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <FaExclamationTriangle />
              Warning!!!
            </h3>
            {Object.entries(apiErrors)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <div key={key}>
                  <p style={{
                    color: darkMode ? '#fca5a5' : '#dc2626',
                    fontSize: '0.875rem',
                  }}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                  </p>
                </div>
              ))}
          </div>
        )}

        {showNotifications && (
          <div style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '350px',
            height: '100vh',
            backgroundColor: darkMode ? '#1e293b' : 'white',
            boxShadow: darkMode ? '-5px 0 15px rgba(0,0,0,0.3)' : '-5px 0 15px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Notifications</div>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowNotifications(false)}
              >
                <FaTimes size={20} />
              </div>
            </div>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification._id} style={{
                  padding: '10px 0',
                  borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ 
                    fontWeight: notification.read ? 'normal' : '600',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                  }}>
                    {notification.message}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!notification.read && (
                      <button 
                        style={{ 
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: darkMode ? '#94a3b8' : '#64748b',
                        }}
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FaCheck size={14} />
                      </button>
                    )}
                    <button 
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: darkMode ? '#94a3b8' : '#64748b',
                      }}
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                color: darkMode ? '#94a3b8' : '#64748b', 
                textAlign: 'center', 
                padding: '15px' 
              }}>
                No notifications
              </div>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: darkMode ? '#1e293b' : 'white',
          borderRadius: '5px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>My Profile</h2>
            
          </div>
          
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '500' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleProfileChange}
                  style={{
                    padding: '10px',
                    borderRadius: '5px',
                    border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email}
                  onChange={handleProfileChange}
                  style={{
                    padding: '10px',
                    borderRadius: '5px',
                    border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button 
                  style={{
                    padding: '10px 15px',
                    backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                    color: darkMode ? '#f8fafc' : '#1e293b',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button 
                  style={{
                    padding: '10px 15px',
                    backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={updateProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p><strong>Name:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role || 'No role specified'}</p>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: darkMode ? '#1e293b' : 'white',
          borderRadius: '5px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px' }}>
            <FaChartBar style={{ marginRight: '10px' }} />
            Voting Analysis
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px',
          }}>
            <div style={{ 
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              borderRadius: '5px',
              padding: '15px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{candidates.length}</div>
              <div style={{ fontSize: '0.875rem' }}>Total Candidates</div>
            </div>
            <div style={{ 
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              borderRadius: '5px',
              padding: '15px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {Object.values(voteResults).reduce((total, candidate) => {
                  return total + (candidate.votes?.length || 0);
                }, 0)}
              </div>
              <div style={{ fontSize: '0.875rem' }}>Total Votes Cast</div>
            </div>
            <div style={{ 
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              borderRadius: '5px',
              padding: '15px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {Object.keys(groupCandidatesByPosition()).length}
              </div>
              <div style={{ fontSize: '0.875rem' }}>Positions</div>
            </div>
            <div style={{ 
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              borderRadius: '5px',
              padding: '15px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {Object.keys(userVotes).length}
              </div>
              <div style={{ fontSize: '0.875rem' }}>Your Assessments</div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Top Candidates by Votes</h3>
            <BarChart
              width={800}
              height={400}
              data={candidates.map(candidate => ({
                name: candidate.name,
                votes: voteResults[candidate._id]?.votes.length || 0,
                percentage: getVotePercentage(candidate._id)
              })).sort((a, b) => b.votes - a.votes).slice(0, 5)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="votes" fill="#8884d8" name="Total Votes" />
              <Bar dataKey="percentage" fill="#82ca9d" name="Approval %" />
            </BarChart>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Vote Distribution by Position</h3>
            <PieChart width={800} height={400}>
              <Pie
                data={Object.entries(groupCandidatesByPosition()).map(([position, candidates]) => ({
                  name: position,
                  value: candidates.reduce((total, candidate) => {
                    return total + (voteResults[candidate._id]?.votes.length || 0);
                  }, 0)
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {Object.entries(groupCandidatesByPosition()).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;