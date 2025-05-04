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
  FaUserCog 
} from 'react-icons/fa';

const VoterDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [voteResults, setVoteResults] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userVoted, setUserVoted] = useState();
  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();

  const voteOptions = [
    { value: 'strong_approve', label: 'Strongly Approve' },
    { value: 'approve', label: 'Approve' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'disapprove', label: 'Disapprove' },
    { value: 'strong_disapprove', label: 'Strongly Disapprove' }
  ];

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    const { token, user, lastUpdated } = authData;
    const { userId, username, role, expiresAt } = user;

    setUserVoted(userId);



    if (authData) {
      try {
        
        setIsAdmin(role === "admin" ? true : false);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    fetchCandidates();
    getVoteResults();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    navigate('/');
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/contestants');
      setCandidates(response.data);
    } catch (err) {
      setError('Failed to fetch candidates. Please try again later.');
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
      const processedResults = response.data.reduce((acc, curr) => {
        const existingCandidate = acc.find(item => item.candidateId === curr.candidateId);
        if (existingCandidate) {
          existingCandidate.totalPercentage += curr.percentage;
          existingCandidate.voteCount++;
        } else {
          acc.push({
            candidateId: curr.candidateId,
            candidateName: curr.candidateName,
            totalPercentage: curr.percentage,
            voteCount: 1
          });
        }
        return acc;
      }, []);

      const resultsWithAverage = processedResults.map(item => ({
        ...item,
        averagePercentage: (item.totalPercentage / item.voteCount).toFixed(1)
      }));

      setVoteResults(resultsWithAverage);
    } catch (err) {
      setError('Could not load vote results. Please try again later.');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (candidateId) => {
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
        userVoted
      });
      alert('Vote submitted successfully!');
      getVoteResults();
    } catch (err) {
      setError('Failed to submit vote. You may have already voted.');
      console.error('Error submitting vote:', err);
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
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: darkMode ? '#475569' : '#cbd5e1',
      },
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: '2rem 0 1rem',
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
    resultsContainer: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginTop: '1.5rem',
      boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
    },
    resultItem: {
      marginBottom: '1.5rem',
    },
    resultHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    resultName: {
      fontWeight: '600',
    },
    resultPercentage: {
      color: darkMode ? '#94a3b8' : '#64748b',
    },
    resultBarContainer: {
      height: '12px',
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      borderRadius: '6px',
      overflow: 'hidden',
    },
    resultBar: {
      height: '100%',
      backgroundColor: '#3b82f6',
      borderRadius: '6px',
      transition: 'width 0.5s ease',
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
  };

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
              Vote
            </Link>
            {isAdmin && (
              <Link to="/register-contestant" style={styles.navLink}>
                <FaUserCog size={20} />
                register contestant
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
        
        <button onClick={handleLogout} style={styles.logoutButton}>
          <FaSignOutAlt size={20} />
          Logout
        </button>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Voter Dashboard</h1>
          <button onClick={() => setDarkMode(!darkMode)} style={styles.themeButton}>
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

        <h2 style={styles.sectionTitle}>Candidates</h2>
        {loading && candidates.length === 0 && <div style={styles.loading}>Loading candidates...</div>}
        {error && candidates.length === 0 && <div style={styles.error}>{error}</div>}
        
        <div style={styles.candidatesGrid}>
          {candidates.map(candidate => (
            <div key={candidate._id} style={styles.candidateCard}>
              <div 
                style={styles.candidateHeader}
                onClick={() => toggleCandidate(candidate._id)}
              >
                <img 
                  src={candidate.profileImage}
                  alt={candidate.name} 
                  style={styles.candidateImage}
                />
                <div style={styles.candidateInfo}>
                  <div style={styles.candidateName}>{candidate.name}</div>
                  <div style={styles.candidateParty}>{candidate.party}</div>
                </div>
                <div style={styles.expandIcon}>
                  {expandedCandidate === candidate._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedCandidate === candidate._id && (
                <div style={styles.candidateDetails}>
                  <p style={styles.candidateBio}>{candidate.bio || 'No biography available'}</p>
                  {candidate.promises && candidate.promises.length > 0 && (
                    <>
                      <div style={styles.promisesTitle}>Key Promises:</div>
                      <ul style={styles.promisesList}>
                        {candidate.promises.map((promise, i) => (
                          <li key={i} style={styles.promiseItem}>{promise}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div style={styles.voteControls}>
                    <select
                      value={selectedVotes[candidate._id] || ''}
                      onChange={(e) => handleVoteChange(candidate._id, e.target.value)}
                      style={styles.voteSelect}
                    >
                      <option value="">Select your vote</option>
                      {voteOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => submitVote(candidate._id)}
                      style={styles.submitButton}
                      disabled={loading || !selectedVotes[candidate._id]}
                    >
                      {loading ? 'Submitting...' : 'Submit Vote'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Live Results</h2>
        {error && <div style={styles.error}>{error}</div>}
        {loading && !voteResults && <div style={styles.loading}>Loading results...</div>}
        
        {voteResults ? (
          <div style={styles.resultsContainer}>
            {voteResults.length > 0 ? (
              voteResults.map((result) => (
                <div key={result.candidateId} style={styles.resultItem}>
                  <div style={styles.resultHeader}>
                    <span style={styles.resultName}>{result.candidateName}</span>
                    <span style={styles.resultPercentage}>{result.averagePercentage}%</span>
                  </div>
                  <div style={styles.resultBarContainer}>
                    <div style={{ ...styles.resultBar, width: `${result.averagePercentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noData}>No voting data available</div>
            )}
          </div>
        ) : (
          !loading && <div style={styles.noData}>No results to display</div>
        )}
      </div>
    </div>
  );
};

export default VoterDashboard;