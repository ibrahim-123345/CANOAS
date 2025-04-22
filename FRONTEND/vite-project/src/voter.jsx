import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VoterDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [voteResults, setVoteResults] = useState(null);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const candidates = [
    {
      id: 'john',
      name: 'John Doe',
      party: 'Progressive Party',
      image: 'https://via.placeholder.com/100?text=John',
      promises: ['Improved Healthcare', 'Better Education', 'Road Infrastructure']
    },
    {
      id: 'jane',
      name: 'Jane Smith',
      party: 'Unity Alliance',
      image: 'https://via.placeholder.com/100?text=Jane',
      promises: ['Economic Reform', 'Climate Action', 'Digital Transformation']
    },
    {
      id: 'alex',
      name: 'Alex Johnson',
      party: 'Future Forward',
      image: 'https://via.placeholder.com/100?text=Alex',
      promises: ['Tax Reduction', 'Job Creation', 'Public Safety']
    }
  ];

  const voteOptions = ['Big Yes', 'Yes', 'Normal', 'No', 'Big No'];

  const fetchVoteResults = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          results: [
            { candidate: 'Isaya Ezra', percentage: 40 },
            { candidate: 'Ibrahimu Mohamed', percentage: 32 },
            { candidate: 'Devid Mrope', percentage: 30 },
            { candidate: 'Moses Liganga', percentage: 3 }
          ],
          timestamp: new Date().toISOString()
        });
      }, 800);
    });
  };

  const getVoteResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://your-api-endpoint/results');
      if (!response.ok) throw new Error('API not responding');
      const data = await response.json();
      setVoteResults(data);
    } catch (err) {
      console.warn('Using mock data:', err.message);
      const mockResults = await fetchVoteResults();
      setVoteResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (candidateId, vote) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, candidateId, vote });
      }, 500);
    });
  };

  const handleVoteSubmit = async (candidateId) => {
    if (!selectedVotes[candidateId]) {
      setError('Please select a vote option');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://your-api-endpoint/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          vote: selectedVotes[candidateId]
        }),
      });

      if (!response.ok) throw new Error('Vote submission failed');
      const data = await response.json();
      console.log('Vote submitted:', data);
      alert('Vote submitted successfully!');
      getVoteResults();
    } catch (err) {
      console.warn('Using mock submission:', err.message);
      const mockResponse = await submitVote(candidateId, selectedVotes[candidateId]);
      console.log('Mock vote submitted:', mockResponse);
      alert('Mock vote recorded (demo purposes)');
      getVoteResults();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVoteResults();
  }, []);

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
      backgroundColor: darkMode ? '#121212' : '#f4f6f6',
      color: darkMode ? '#ffffff' : '#333333',
      transition: 'all 0.3s ease',
    },
    sidebar: {
      width: '220px',
      backgroundColor: darkMode ? '#1a365d' : '#3796f5',
      color: 'white',
      padding: '30px 15px',
      minHeight: '100vh',
    },
    link: {
      display: 'block',
      color: 'white',
      textDecoration: 'none',
      padding: '10px 15px',
      marginBottom: '10px',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: '6px',
    },
    mainContent: {
      flexGrow: 1,
      padding: '30px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '600',
    },
    themeButton: {
      padding: '10px 20px',
      backgroundColor: darkMode ? '#4a5568' : '#2c3e50',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    candidateCard: {
      backgroundColor: darkMode ? '#1a202c' : '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    },
    candidateHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    candidateImage: {
      width: '100px',
      borderRadius: '50%',
      marginBottom: '10px',
    },
    voteControls: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    voteSelect: {
      padding: '8px',
    },
    submitButton: {
      padding: '8px 15px',
      backgroundColor: darkMode ? '#4299e1' : '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    resultBar: {
      height: '20px',
      backgroundColor: '#3182ce',
      borderRadius: '4px',
      marginBottom: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2>Dashboard</h2>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/vote" style={styles.link}>Vote</Link>
        <Link to="/results" style={styles.link}>Results</Link>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome, Voter!</h1>
          <button onClick={() => setDarkMode(!darkMode)} style={styles.themeButton}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <h2>Candidates</h2>
        {candidates.map(candidate => (
          <div key={candidate.id} style={styles.candidateCard}>
            <div style={styles.candidateHeader} onClick={() => toggleCandidate(candidate.id)}>
              <strong>{candidate.name} ({candidate.party})</strong>
              <span>{expandedCandidate === candidate.id ? '▲' : '▼'}</span>
            </div>

            {expandedCandidate === candidate.id && (
              <>
                <img src={candidate.image} alt={candidate.name} style={styles.candidateImage} />
                <ul>
                  {candidate.promises.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
                <div style={styles.voteControls}>
                  <select
                    value={selectedVotes[candidate.id] || ''}
                    onChange={(e) => handleVoteChange(candidate.id, e.target.value)}
                    style={styles.voteSelect}
                  >
                    <option value="">Select Vote</option>
                    {voteOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleVoteSubmit(candidate.id)}
                    style={styles.submitButton}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <h2>Live Vote Results</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && !voteResults && <p>Loading...</p>}
        {voteResults && voteResults.results.map((res, i) => (
          <div key={i}>
            <p>{res.candidate}: {res.percentage}%</p>
            <div style={{ ...styles.resultBar, width: `${res.percentage}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoterDashboard;
