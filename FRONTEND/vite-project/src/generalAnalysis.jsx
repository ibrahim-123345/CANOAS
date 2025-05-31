import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaVoteYea, 
  FaChartBar, 
  FaUserCog,
  FaSignOutAlt,
  FaUserCircle,
  FaSearch,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const GeneralAnalysis = () => {
  const [candidates, setCandidates] = useState([]);
  const [voteResults, setVoteResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'averageApproval', direction: 'desc' });
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
      setIsAdmin(authData.user.role === "admin");
    }
    fetchCandidates();
    fetchAllVotes();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/contestants');
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
    }
  };

  const fetchAllVotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/vote');
      const results = {};

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
      });
      
      // Calculate averages
      Object.keys(results).forEach(candidateId => {
        results[candidateId].averageApproval = 
          results[candidateId].voteCount > 0 
            ? (results[candidateId].totalPercentage / results[candidateId].voteCount).toFixed(1)
            : 0;
      });
      
      setVoteResults(results);
    } catch (err) {
      console.error('Error fetching all votes:', err);
      setError('Failed to load voting data');
    } finally {
      setLoading(false);
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

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCandidates = (candidates) => {
    return [...candidates].sort((a, b) => {
      const aStats = voteResults[a._id] || {};
      const bStats = voteResults[b._id] || {};
      
      let aValue, bValue;
      
      if (sortConfig.key === 'averageApproval') {
        aValue = parseFloat(aStats.averageApproval || 0);
        bValue = parseFloat(bStats.averageApproval || 0);
      } else if (sortConfig.key === 'voteCount') {
        aValue = aStats.voteCount || 0;
        bValue = bStats.voteCount || 0;
      } else if (sortConfig.key === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else {
        return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    navigate('/login');
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const candidateStats = voteResults[candidate._id] || {};
    
    return (
      candidate.name.toLowerCase().includes(lowerSearch) ||
      candidate.party.toLowerCase().includes(lowerSearch) ||
      candidate.position.toLowerCase().includes(lowerSearch) ||
      candidate._id.toLowerCase().includes(lowerSearch) ||
      Object.entries(candidateStats.voteDistribution || {}).some(
        ([key, value]) => key.toLowerCase().includes(lowerSearch) || value.toString().includes(lowerSearch)
    )
    );
  });

  const groupedCandidates = groupCandidatesByPosition();

  const getPositionChartData = (position) => {
    const positionCandidates = candidates.filter(c => c.position === position);
    
    const labels = positionCandidates.map(c => c.name);
    const averages = positionCandidates.map(c => {
      const stats = voteResults[c._id] || {};
      return parseFloat(stats.averageApproval || 0);
    });
    const colors = averages.map(avg => getVoteColor(avg));
    
    return {
      labels,
      datasets: [{
        label: 'Approval Rating',
        data: averages,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.6', '1')),
        borderWidth: 1
      }]
    };
  };

  const getVoteDistributionData = (candidateId) => {
    const stats = voteResults[candidateId] || {};
    const distribution = stats.voteDistribution || {};
    
    return {
      labels: voteOptions.map(opt => opt.label),
      datasets: [{
        data: voteOptions.map(opt => distribution[opt.value] || 0),
        backgroundColor: voteOptions.map(opt => opt.color),
        borderWidth: 1
      }]
    };
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="sidebar">
          {/* Sidebar content */}
        </div>
        <div className="main-content">
          <div className="loading">Loading analysis data...</div>
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
            <Link to="/generalAnalysis" className="nav-link active">
              <FaChartBar className="nav-icon" /> 
              <span>General Analysis</span>
            </Link>
            
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
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt className="logout-icon" /> 
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>General Analysis Dashboard</h1>
          
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search candidates by name, party, position, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {searchTerm ? (
          <div className="search-results">
            <h2>Search Results</h2>
            <div className="candidates-table">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>
                      Name {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th>Position</th>
                    <th>Party</th>
                    <th onClick={() => handleSort('averageApproval')}>
                      Approval {sortConfig.key === 'averageApproval' && (
                        sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th onClick={() => handleSort('voteCount')}>
                      Votes {sortConfig.key === 'voteCount' && (
                        sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                      )}
                    </th>
                    <th>Vote Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedCandidates(filteredCandidates).map(candidate => {
                    const stats = voteResults[candidate._id] || {};
                    return (
                      <tr key={candidate._id}>
                        <td>
                          <div className="candidate-info">
                            <img 
                              src={candidate.profileImage || 'https://via.placeholder.com/40'} 
                              alt={candidate.name}
                              className="candidate-thumb"
                            />
                            {candidate.name}
                          </div>
                        </td>
                        <td>{candidate.position}</td>
                        <td>{candidate.party}</td>
                        <td>
                          <div className="approval-cell" style={{ color: getVoteColor(stats.averageApproval) }}>
                            {stats.averageApproval}%
                          </div>
                        </td>
                        <td>{stats.voteCount || 0}</td>
                        <td>
                          <div className="distribution-chart">
                            <Pie 
                              data={getVoteDistributionData(candidate._id)}
                              options={{ 
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                              }}
                              height={60}
                              width={100}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          Object.entries(groupedCandidates).map(([position, positionCandidates]) => {
            const sortedCandidates = getSortedCandidates(positionCandidates);
            const topCandidates = sortedCandidates.slice(0, 3);
            
            return (
              <div key={position} className="position-section">
                <h2>{position} Candidates</h2>
                
                <div className="position-chart">
                  <Bar
                    data={getPositionChartData(position)}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: `${position} Approval Ratings` }
                      }
                    }}
                  />
                </div>
                
                <h3>Top Performers</h3>
                <div className="top-candidates">
                  {topCandidates.map((candidate, index) => {
                    const stats = voteResults[candidate._id] || {};
                    return (
                      <div key={candidate._id} className="top-candidate">
                        <div className="rank">{index + 1}</div>
                        <img 
                          src={candidate.profileImage || 'https://via.placeholder.com/60'} 
                          alt={candidate.name}
                          className="candidate-img"
                        />
                        <div className="candidate-details">
                          <h4>{candidate.name}</h4>
                          <p>{candidate.party}</p>
                          <div className="approval" style={{ color: getVoteColor(stats.averageApproval) }}>
                            {stats.averageApproval}% Approval
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <h3>All Candidates</h3>
                <div className="candidates-table">
                  <table>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')}>
                          Name {sortConfig.key === 'name' && (
                            sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                          )}
                        </th>
                        <th>Party</th>
                        <th onClick={() => handleSort('averageApproval')}>
                          Approval {sortConfig.key === 'averageApproval' && (
                            sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                          )}
                        </th>
                        <th onClick={() => handleSort('voteCount')}>
                          Votes {sortConfig.key === 'voteCount' && (
                            sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />
                          )}
                        </th>
                        <th>Vote Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCandidates.map(candidate => {
                        const stats = voteResults[candidate._id] || {};
                        return (
                          <tr key={candidate._id}>
                            <td>
                              <div className="candidate-info">
                                <img 
                                  src={candidate.profileImage || 'https://via.placeholder.com/40'} 
                                  alt={candidate.name}
                                  className="candidate-thumb"
                                />
                                {candidate.name}
                              </div>
                            </td>
                            <td>{candidate.party}</td>
                            <td>
                              <div className="approval-cell" style={{ color: getVoteColor(stats.averageApproval) }}>
                                {stats.averageApproval}%
                              </div>
                            </td>
                            <td>{stats.voteCount || 0}</td>
                            <td>
                              <div className="distribution-chart">
                                <Pie 
                                  data={getVoteDistributionData(candidate._id)}
                                  options={{ 
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                  }}
                                  height={60}
                                  width={100}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
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
          background-color: white;
        }

        .content-header {
          margin-bottom: 30px;
        }
        
        .content-header h1 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        
        .search-container {
          position: relative;
          margin-bottom: 20px;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }
        
        .search-input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .position-section {
          margin-bottom: 40px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .position-section h2 {
          color: #2c3e50;
          margin-top: 0;
        }
        
        .position-section h3 {
          color: #34495e;
          margin: 20px 0 15px;
        }
        
        .position-chart {
          height: 300px;
          margin: 20px 0;
        }
        
        .top-candidates {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .top-candidate {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          gap: 15px;
        }
        
        .rank {
          font-size: 1.5rem;
          font-weight: bold;
          color: #7f8c8d;
        }
        
        .candidate-img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .candidate-details h4 {
          margin: 0 0 5px;
        }
        
        .candidate-details p {
          margin: 0 0 5px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .approval {
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .candidates-table {
          overflow-x: auto;
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
          background: #f8f9fa;
          color: #2c3e50;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
        }
        
        th:hover {
          background: #f1f3f5;
        }
        
        tr:hover {
          background: #f8f9fa;
        }
        
        .candidate-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .candidate-thumb {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .approval-cell {
          font-weight: bold;
        }
        
        .distribution-chart {
          width: 100px;
          height: 60px;
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
          
          .top-candidates {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default GeneralAnalysis;