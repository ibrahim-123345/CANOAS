import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaVoteYea, 
  FaChartBar, 
  FaSun, 
  FaMoon, 
  FaPlusCircle,
  FaChevronUp,
  FaChevronDown,
  FaSignOutAlt,
  FaUserCog,
  FaBell,
  FaTimes,
  FaExclamationTriangle,
  FaUserCircle,
  FaCheck,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const UserDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [voteResults, setVoteResults] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userVoted, setUserVoted] = useState();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve', color: '#10B981' },
    { value: 'approve', label: 'Approve', color: '#34D399' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280' },
    { value: 'disapprove', label: 'Disapprove', color: '#F59E0B' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove', color: '#EF4444' }
  ];

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
          name: user.userId || '',
          email: user.email || '',
          bio: user.bio || ''
        });
        
        fetchNotifications();
        fetchUserVotes(user.userId);
        //fetchUserProfile(user.userId);
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

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/users/${userId}`);
      setEditedProfile({
        name: response.data.name,
        email: response.data.email,
        bio: response.data.bio || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setApiErrors(prev => ({
        ...prev,
        profile: 'Failed to fetch user profile'
      }));
    }
  };

  const updateProfile = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('authData'));
      const response = await axios.put(`http://localhost:8000/users/${authData.user.userId}`, editedProfile);
      setEditedProfile(response.data);
      setEditMode(false);
      // Update local storage with new data
      const updatedAuthData = {
        ...authData,
        user: {
          ...authData.user,
          name: response.data.name,
          email: response.data.email,
          bio: response.data.bio
        }
      };
      localStorage.setItem('authData', JSON.stringify(updatedAuthData));
    } catch (err) {
      console.error('Error updating profile:', err);
      setApiErrors(prev => ({
        ...prev,
        profileUpdate: err.response?.data?.message || 'Failed to update profile'
      }));
    }
  };

  const fetchUserVotes = async (userId) => {
    try {
      const response = await axios.post('http://localhost:8000/getVotePercentage', { 
        userId
      });

      const votes = response.data.reduce((acc, vote) => {
        acc[vote.candidateId] = vote.voteValue;
        return acc;
      }, {});
      setUserVotes(votes);
      setApiErrors(prev => ({ ...prev, userVotes: null }));
    } catch (err) {
      console.error('Error fetching user votes:', err);
      setApiErrors(prev => ({
        ...prev,
        userVotes: err.response?.data?.message || 'Failed to fetch your previous votes'
      }));
    }
  };

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
        if (!vote.contestant) {
          console.warn("Invalid vote: missing contestant", vote);
          return;
        }

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

  const getUserVoteColor = (candidateId) => {
    const voteValue = userVotes[candidateId];
    if (!voteValue) return '#6B7280';
    const option = voteOptions.find(opt => opt.value === voteValue);
    return option ? option.color : '#6B7280';
  };

  const getUserVoteLabel = (candidateId) => {
    const candidateData = voteResults[candidateId];
    if (!candidateData || candidateData.votes.length === 0) return 'Not assessed';

    const latestVote = candidateData.votes[candidateData.votes.length - 1];
    const voteValue = latestVote.voteValue;

    const option = voteOptions.find(opt => opt.value === voteValue);
    return option ? option.label : 'Unknown';
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

  const analyzeVotes = (candidateId = null) => {
    setShowAnalysis(true);
    
    if (candidateId) {
      // Individual candidate analysis
      const candidate = candidates.find(c => c._id === candidateId);
      const votes = voteResults[candidateId]?.votes || [];
      
      // Group by vote type
      const voteCounts = voteOptions.map(option => {
        const count = votes.filter(v => v.voteValue === option.value).length;
        return {
          name: option.label,
          value: count,
          color: option.color
        };
      });

      setAnalysisData({
        type: 'individual',
        candidate: candidate.name,
        position: candidate.position,
        totalVotes: votes.length,
        voteCounts,
        votes
      });
    } else {
      // Overall analysis
      const positions = Object.keys(groupCandidatesByPosition());
      const positionStats = positions.map(position => {
        const positionCandidates = candidates.filter(c => c.position === position);
        const positionVotes = positionCandidates.reduce((total, candidate) => {
          return total + (voteResults[candidate._id]?.votes.length || 0);
        }, 0);
        
        return {
          position,
          candidates: positionCandidates.length,
          votes: positionVotes
        };
      });

      // Top candidates by votes
      const allCandidates = candidates.map(candidate => {
        const votes = voteResults[candidate._id]?.votes || [];
        return {
          id: candidate._id,
          name: candidate.name,
          position: candidate.position,
          votes: votes.length,
          percentage: getVotePercentage(candidate._id)
        };
      }).sort((a, b) => b.votes - a.votes).slice(0, 5);

      setAnalysisData({
        type: 'overall',
        totalCandidates: candidates.length,
        totalVotes: Object.values(voteResults).reduce((total, candidate) => {
          return total + (candidate.votes?.length || 0);
        }, 0),
        positions: positions.length,
        positionStats,
        topCandidates: allCandidates
      });
    }
  };

  const submitVote = async (candidateId, position) => {
    if (!selectedVotes[candidateId]) {
      setError('Please select a vote option');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:8000/vote', {
        candidateId,
        voteValue: selectedVotes[candidateId],
        userVoted,
        position
      });
      
      setUserVotes(prev => ({
        ...prev,
        [candidateId]: selectedVotes[candidateId]
      }));
      
      getVoteResults();
      fetchUserVotes(userVoted);
      setError(null);
      setApiErrors(prev => ({ ...prev, submitVote: null }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assess. You may have already assessed the candidate.';
      setError(errorMsg);
      setApiErrors(prev => ({
        ...prev,
        submitVote: errorMsg
      }));
      console.error('Error assessing:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCandidate = (candidateId) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
    setShowAnalysis(false);
  };

  const handleVoteChange = (candidateId, value) => {
    setSelectedVotes(prev => ({ ...prev, [candidateId]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#1a1b1e' : '#f8fafc',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
      width: '280px',
      backgroundColor: darkMode ? '#0f172a' : '#1e40af',
      color: 'white',
      padding: '2rem 1.5rem',
      minHeight: '100vh',
      boxShadow: darkMode ? 'none' : '2px 0 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    navContainer: {
      flex: 1,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'white',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
    },
    activeLink: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'white',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
    mainContent: {
      flexGrow: 1,
      padding: '2rem 3rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: darkMode ? '#f8fafc' : '#1e293b',
    },
    themeButton: {
      padding: '0.5rem 1rem',
      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.3)',
      },
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: '2rem 0 1rem',
      color: darkMode ? '#f8fafc' : '#1e293b',
    },
    positionSection: {
      marginBottom: '2.5rem',
    },
    positionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      color: darkMode ? '#f8fafc' : '#1e293b',
    },
    candidatesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    },
    candidateCard: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    candidateHeader: {
      padding: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    candidateImage: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `3px solid ${darkMode ? '#1e40af' : '#3b82f6'}`,
    },
    candidateInfo: {
      flex: 1,
    },
    candidateName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
    },
    candidateParty: {
      fontSize: '0.875rem',
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    candidatePosition: {
      fontSize: '0.875rem',
      color: darkMode ? '#60A5FA' : '#2563EB',
      fontWeight: '500',
      marginTop: '0.25rem',
    },
    expandIcon: {
      fontSize: '1.25rem',
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    candidateDetails: {
      padding: '0 1.5rem 1.5rem',
      borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    candidateBio: {
      marginBottom: '1rem',
      color: darkMode ? '#cbd5e1' : '#475569',
      lineHeight: '1.6',
    },
    promisesTitle: {
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: darkMode ? '#f8fafc' : '#1e293b',
    },
    promisesList: {
      paddingLeft: '1.25rem',
      marginBottom: '1.5rem',
    },
    promiseItem: {
      marginBottom: '0.5rem',
      color: darkMode ? '#cbd5e1' : '#475569',
    },
    voteControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    voteSelect: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    submitButton: {
      padding: '0.75rem',
      backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: darkMode ? '#2563eb' : '#1d4ed8',
      },
      ':disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    error: {
      color: '#ef4444',
      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
      padding: '1rem',
      borderRadius: '0.5rem',
      margin: '1rem 0',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    noData: {
      textAlign: 'center',
      padding: '2rem',
      color: darkMode ? '#94a3b8' : '#64748b',
      backgroundColor: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.05)',
      borderRadius: '0.5rem',
    },
    notificationIcon: {
      position: 'relative',
      cursor: 'pointer',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.5rem',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
    },
    notificationBadge: {
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
    },
    notificationPanel: {
      position: 'fixed',
      top: '0',
      right: '0',
      width: '350px',
      height: '100vh',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      boxShadow: darkMode ? '-5px 0 15px rgba(0,0,0,0.3)' : '-5px 0 15px rgba(0,0,0,0.1)',
      zIndex: 1000,
      padding: '1.5rem',
      transform: showNotifications ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
    },
    notificationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    notificationTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
    },
    notificationClose: {
      cursor: 'pointer',
      padding: '0.5rem',
    },
    notificationItem: {
      padding: '0.75rem 0',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationMessage: {
      flex: 1,
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontWeight: (props) => props.read ? 'normal' : '600',
    },
    notificationMark: {
      color: '#3b82f6',
      cursor: 'pointer',
      marginLeft: '1rem',
      fontSize: '0.875rem',
    },
    candidateProgress: {
      marginTop: '0.5rem',
    },
    progressText: {
      fontSize: '0.875rem',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginBottom: '0.25rem',
    },
    userVoteIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    userVoteDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
    },
    userVoteText: {
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    progressBarContainer: {
      height: '6px',
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '0.25rem',
    },
    progressBar: {
      height: '100%',
      borderRadius: '3px',
    },
    apiErrorContainer: {
      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
      borderLeft: '4px solid #ef4444',
      padding: '1rem',
      margin: '1rem 0',
      borderRadius: '0 0.5rem 0.5rem 0',
    },
    apiErrorTitle: {
      fontWeight: '600',
      color: '#ef4444',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    apiErrorMessage: {
      color: darkMode ? '#fca5a5' : '#dc2626',
      fontSize: '0.875rem',
    },
    accountLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'white',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255,255,255,0.15)',
      },
    },
    accomplishmentItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
    accomplishmentIcon: {
      flexShrink: 0,
      marginTop: '0.25rem',
    },
    accomplishmentContent: {
      flex: 1,
    },
    accomplishmentPromise: {
      fontWeight: '500',
      color: darkMode ? '#e2e8f0' : '#1e293b',
    },
    accomplishmentDetails: {
      fontSize: '0.875rem',
      color: darkMode ? '#94a3b8' : '#64748b',
      marginTop: '0.25rem',
    },
    analysisContainer: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
    },
    analysisTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: darkMode ? '#f8fafc' : '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    analysisStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    statCard: {
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      borderRadius: '0.5rem',
      padding: '1rem',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: darkMode ? '#f8fafc' : '#1e293b',
      marginBottom: '0.25rem',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    chartContainer: {
      marginTop: '2rem',
    },
    profileContainer: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
    },
    profileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    profileTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: darkMode ? '#f8fafc' : '#1e293b',
    },
    profileForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    formLabel: {
      fontWeight: '500',
      color: darkMode ? '#e2e8f0' : '#1e293b',
    },
    formInput: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontSize: '1rem',
    },
    formTextarea: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontSize: '1rem',
      minHeight: '100px',
      resize: 'vertical',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1rem',
    },
    actionButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
    },
    saveButton: {
      backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
      color: 'white',
      ':hover': {
        backgroundColor: darkMode ? '#2563eb' : '#1d4ed8',
      },
    },
    cancelButton: {
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#f8fafc' : '#1e293b',
      ':hover': {
        backgroundColor: darkMode ? '#475569' : '#cbd5e1',
      },
    },
    editButton: {
      backgroundColor: darkMode ? '#f59e0b' : '#f59e0b',
      color: 'white',
      ':hover': {
        backgroundColor: darkMode ? '#d97706' : '#d97706',
      },
    },
    notificationActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    notificationActionButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: darkMode ? '#94a3b8' : '#64748b',
      ':hover': {
        color: darkMode ? '#f8fafc' : '#1e293b',
      },
    },
  };

  const groupedCandidates = groupCandidatesByPosition();
  const authData = JSON.parse(localStorage.getItem('authData'));
  const user = authData?.user;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logo}>
            <FaPlusCircle size={24} />
            <span>CANOAS</span>
          </div>
          <nav style={styles.navContainer}>
            <Link to="/" style={styles.navLink}>
              <FaHome size={20} />
              Home
            </Link>
            <Link to="/vote" style={{ ...styles.navLink, ...styles.activeLink }}>
              <FaVoteYea size={20} />
              Assess 
            </Link>
            <Link to="/analysis" style={styles.navLink}>
              <FaChartBar size={20} />
              Analysis
            </Link>
            <div 
              style={styles.notificationIcon} 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <div style={styles.notificationBadge}>
                  {notifications.filter(n => !n.read).length}
                </div>
              )}
              Notifications
            </div>
            <Link to="/account" style={styles.accountLink}>
              <FaUserCircle size={20} />
              My Account
            </Link>
          </nav>
        </div>
        
        <div>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={styles.themeButton}
          >
            {darkMode ? (
              <>
                <FaSun size={16} />
                Light Mode
              </>
            ) : (
              <>
                <FaMoon size={16} />
                Dark Mode
              </>
            )}
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <FaSignOutAlt size={20} />
            Logout
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>User Dashboard</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={styles.themeButton}
          >
            {darkMode ? (
              <>
                <FaSun size={16} />
                Light Mode
              </>
            ) : (
              <>
                <FaMoon size={16} />
                Dark Mode
              </>
            )}
          </button>
        </div>

        {/* API Error Display */}
        {Object.keys(apiErrors).filter(key => apiErrors[key]).length > 0 && (
          <div style={styles.apiErrorContainer}>
            <h3 style={styles.apiErrorTitle}>
              <FaExclamationTriangle />
              Warning!!!
            </h3>
            {Object.entries(apiErrors)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <div key={key}>
                  <p style={styles.apiErrorMessage}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                  </p>
                </div>
              ))}
          </div>
        )}

        {showNotifications && (
          <div style={styles.notificationPanel}>
            <div style={styles.notificationHeader}>
              <div style={styles.notificationTitle}>Notifications</div>
              <div 
                style={styles.notificationClose}
                onClick={() => setShowNotifications(false)}
              >
                <FaTimes size={20} />
              </div>
            </div>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification._id} style={styles.notificationItem}>
                  <div style={{ ...styles.notificationMessage, fontWeight: notification.read ? 'normal' : '600' }}>
                    {notification.message}
                  </div>
                  <div style={styles.notificationActions}>
                    {!notification.read && (
                      <button 
                        style={styles.notificationActionButton}
                        onClick={() => markAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FaCheck size={14} />
                      </button>
                    )}
                    <button 
                      style={styles.notificationActionButton}
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', padding: '1rem' }}>
                No notifications
              </div>
            )}
          </div>
        )}

        {/* Profile Section 
       <div style={styles.profileContainer}>
          <div style={styles.profileHeader}>
            <h2 style={styles.profileTitle}>My Profile</h2>
            {!editMode && (
              <button 
                style={{ ...styles.actionButton, ...styles.editButton }}
                onClick={() => setEditMode(true)}
              >
                <FaEdit style={{ marginRight: '0.5rem' }} />
                Edit Profile
              </button>
            )}
          </div>
          
          {editMode ? (
            <div style={styles.profileForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleProfileChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email}
                  onChange={handleProfileChange}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Bio</label>
                <textarea
                  name="bio"
                  value={editedProfile.bio}
                  onChange={handleProfileChange}
                  style={styles.formTextarea}
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  style={{ ...styles.actionButton, ...styles.cancelButton }}
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button 
                  style={{ ...styles.actionButton, ...styles.saveButton }}
                  onClick={updateProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Bio:</strong> {user?.bio || 'No bio provided'}</p>
            </div>
          )}
        </div>*/}

        {/* Analysis Section */}
        <div style={styles.analysisContainer}>
          <h2 style={styles.analysisTitle}>
            <FaChartBar />
            Voting Analysis
          </h2>
          
          <div style={styles.analysisStats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{candidates.length}</div>
              <div style={styles.statLabel}>Total Candidates</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {Object.values(voteResults).reduce((total, candidate) => {
                  return total + (candidate.votes?.length || 0);
                }, 0)}
              </div>
              <div style={styles.statLabel}>Total Votes Cast</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {Object.keys(groupCandidatesByPosition()).length}
              </div>
              <div style={styles.statLabel}>Positions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {Object.keys(userVotes).length}
              </div>
              <div style={styles.statLabel}>Your Assessments</div>
            </div>
          </div>

          <div style={styles.chartContainer}>
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

          <div style={styles.chartContainer}>

            {  /*    
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
            </PieChart> */}
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default UserDashboard;