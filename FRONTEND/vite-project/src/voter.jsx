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
  FaTimesCircle
} from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Mock data for previous accomplishments
const mockPreviousAccomplishments = {
  '682883977af41b1fc26e7334': [
    { promise: "Build new roads in the district", accomplished: true, details: "Completed construction of 3 major roads" },
    { promise: "Improve school facilities", accomplished: true, details: "Renovated 5 primary schools" },
    { promise: "Create youth employment program", accomplished: false, details: "Program stalled due to budget constraints" }
  ],
  '682883c67af41b1fc26e7337': [
    { promise: "Reduce water shortages", accomplished: true, details: "Built 2 new water treatment plants" },
    { promise: "Improve healthcare access", accomplished: true, details: "Constructed 1 new hospital" },
    { promise: "Lower local taxes", accomplished: false, details: "Taxes remained the same" }
  ],
  '65d0f8b9e899d3a9c8f7d125': [
    { promise: "Increase police presence", accomplished: true, details: "Hired 50 new officers" },
    { promise: "Modernize public transport", accomplished: false, details: "Project delayed" },
    { promise: "Support small businesses", accomplished: true, details: "Launched grant program" }
  ]
};

const VoterDashboard = () => {
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [previousAccomplishments, setPreviousAccomplishments] = useState({});
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve', color: '#10B981' },
    { value: 'approve', label: 'Approve', color: '#34D399' },
    { value: 'neutral', label: 'Neutral', color: '#6B7280' },
    { value: 'disapprove', label: 'Disapprove', color: '#F59E0B' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove', color: '#EF4444' }
  ];

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (authData) {
      try {
        const { user } = authData;
        setUserVoted(user.userId);
        setIsAdmin(user.role === "admin");
        
        if (user.role !== "admin") {
          fetchNotifications();
          setUserVoted(user.userId);
          
        }
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
    // Load mock accomplishments (in real app, this would be an API call)
    setPreviousAccomplishments(mockPreviousAccomplishments);
  }, []);

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

  const showConfirmation = (candidateId, position) => {
    confirmAlert({
      title: 'Confirm Assessment',
      message: 'There is no going back once assessed. Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => submitVote(candidateId, position)
          
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      overlayClassName: darkMode ? 'dark-overlay' : '',
      customUI: ({ onClose }) => {
        return (
          <div style={{
            backgroundColor: darkMode ? '#1E293B' : 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            color: darkMode ? '#F8FAFC' : '#1E293B',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <FaExclamationTriangle 
                size={24} 
                color="#F59E0B" 
                style={{ marginRight: '1rem' }} 
              />
              <h2 style={{ margin: 0 }}>Confirm Assessment</h2>
            </div>
            <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
              There is no going back once assessed. Are you sure you want to proceed?
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: darkMode ? '#334155' : '#E2E8F0',
                  color: darkMode ? '#F8FAFC' : '#1E293B',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submitVote(candidateId, position);
                  onClose();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        );
      }
    });
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
      //fetchUserVotes(userVoted);


         await axios.post(
          'http://localhost:8000/notifications',
          {
  "message":"new vote to candidate "+candidateId+" for position "+position,
  "read": false
})

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
  };

  const handleVoteChange = (candidateId, value) => {
    setSelectedVotes(prev => ({ ...prev, [candidateId]: value }));
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
    adminLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#f59e0b',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s ease',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      ':hover': {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
      },
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
  };

  const groupedCandidates = groupCandidatesByPosition();

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
            {!isAdmin && (
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
            )}
            {!isAdmin && (
              <Link to="/userDashboard" style={styles.accountLink}>
                <FaUserCircle size={20} />
                My Account
              </Link>
            )}
            {isAdmin && (
              <Link to="/register-contestant" style={styles.navLink}>
                <FaUserCog size={20} />
                Register Contestant
              </Link>
            )}
            {isAdmin && (
              <Link to="/" style={styles.adminLink}>
                <FaUserCog size={20} />
                Admin Dashboard
              </Link>
            )}
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
          <h1 style={styles.title}>Assessor Dashboard</h1>
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
                  {!notification.read && (
                    <div 
                      style={styles.notificationMark}
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark as read
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: darkMode ? '#94a3b8' : '#64748b', textAlign: 'center', padding: '1rem' }}>
                No notifications
              </div>
            )}
          </div>
        )}

        <h2 style={styles.sectionTitle}>Candidates by Position</h2>
        {loading && candidates.length === 0 && <div style={styles.loading}>Loading candidates...</div>}
        {error && candidates.length === 0 && <div style={styles.error}>{error}</div>}
        
        {!expandedCandidate && Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
          <div key={position} style={styles.positionSection}>
            <h3 style={styles.positionTitle}>{position}</h3>
            <div style={styles.candidatesGrid}>
              {positionCandidates.map(candidate => (
                <div 
                  key={candidate._id} 
                  style={styles.candidateCard}
                >
                  <div 
                    style={styles.candidateHeader}
                    onClick={() => toggleCandidate(candidate._id)}
                  >
                    <img 
                      src={candidate.profileImage || 'https://via.placeholder.com/80'}
                      alt={candidate.name} 
                      style={styles.candidateImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80';
                      }}
                    />
                    <div style={styles.candidateInfo}>
                      <div style={styles.candidateName}>{candidate.name}</div>
                      <div style={styles.candidateParty}>{candidate.party}</div>
                      <div style={styles.candidateProgress}>
                        <div style={styles.progressText}>
                          Approval: {getVotePercentage(candidate._id)}%
                        </div>
                        <div style={styles.progressBarContainer}>
                          <div style={{ 
                            ...styles.progressBar, 
                            width: `${getVotePercentage(candidate._id)}%`,
                            backgroundColor: getVotePercentage(candidate._id) > 50 ? '#10B981' : 
                                           getVotePercentage(candidate._id) > 30 ? '#3B82F6' : '#EF4444'
                          }} />
                        </div>
                        <div style={styles.userVoteIndicator}>
                          <div style={{ 
                            ...styles.userVoteDot,
                            backgroundColor: getUserVoteColor(candidate._id)
                          }} />
                          <div style={styles.userVoteText}>
                            Your assessment: {getUserVoteLabel(candidate._id)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={styles.expandIcon}>
                      <FaChevronDown />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {expandedCandidate && candidates.filter(c => c._id === expandedCandidate).map(candidate => (
          <div key={candidate._id} style={{ marginBottom: '2rem' }}>
            <div style={styles.candidateCard}>
              <div 
                style={styles.candidateHeader}
                onClick={() => toggleCandidate(candidate._id)}
              >
                <img 
                  src={candidate.profileImage || 'https://via.placeholder.com/80'}
                  alt={candidate.name} 
                  style={styles.candidateImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div style={styles.candidateInfo}>
                  <div style={styles.candidateName}>{candidate.name}</div>
                  <div style={styles.candidateParty}>{candidate.party}</div>
                  <div style={styles.candidatePosition}>{candidate.position}</div>
                  <div style={styles.candidateProgress}>
                    <div style={styles.progressText}>
                      Approval: {getVotePercentage(candidate._id)}%
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div style={{ 
                        ...styles.progressBar, 
                        width: `${getVotePercentage(candidate._id)}%`,
                        backgroundColor: getVotePercentage(candidate._id) > 50 ? '#10B981' : 
                                       getVotePercentage(candidate._id) > 30 ? '#3B82F6' : '#EF4444'
                      }} />
                    </div>
                    <div style={styles.userVoteIndicator}>
                      <div style={{ 
                        ...styles.userVoteDot,
                        backgroundColor: getUserVoteColor(candidate._id)
                      }} />
                      <div style={styles.userVoteText}>
                        Your assessment: {getUserVoteLabel(candidate._id)}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={styles.expandIcon}>
                  <FaChevronUp />
                </div>
              </div>

              <div style={styles.candidateDetails}>
                <p style={styles.candidateBio}>{candidate.bio || 'No biography available'}</p>
                
                {candidate.promises && candidate.promises.length > 0 && (
                  <>
                    <div style={styles.promisesTitle}>Current Promises:</div>
                    <ul style={styles.promisesList}>
                      {candidate.promises.map((promise, i) => (
                        <li key={i} style={styles.promiseItem}>{promise}</li>
                      ))}
                    </ul>
                  </>
                )}

                {previousAccomplishments[candidate._id] && previousAccomplishments[candidate._id].length > 0 && (
                  <>
                    <div style={styles.promisesTitle}>Previous Performance:</div>
                    <div>
                      {previousAccomplishments[candidate._id].map((item, i) => (
                        <div key={i} style={styles.accomplishmentItem}>
                          <div style={styles.accomplishmentIcon}>
                            {item.accomplished ? (
                              <FaCheck color="#10B981" size={16} />
                            ) : (
                              <FaTimesCircle color="#EF4444" size={16} />
                            )}
                          </div>
                          <div style={styles.accomplishmentContent}>
                            <div style={styles.accomplishmentPromise}>{item.promise}</div>
                            <div style={styles.accomplishmentDetails}>{item.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={styles.voteControls}>
                  {userVotes[candidate._id] ? (
                    <div style={{ 
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                      color: darkMode ? '#93C5FD' : '#1E40AF',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      You've already assessed this candidate as: {getUserVoteLabel(candidate._id)}
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedVotes[candidate._id] || ''}
                        onChange={(e) => handleVoteChange(candidate._id, e.target.value)}
                        style={styles.voteSelect}
                      >
                        <option value="">Select your assessment</option>
                        {voteOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => showConfirmation(candidate._id, candidate.position)}
                        style={styles.submitButton}
                        disabled={loading || !selectedVotes[candidate._id]}
                      >
                        {loading ? 'Submitting...' : 'Submit Assessment'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoterDashboard;