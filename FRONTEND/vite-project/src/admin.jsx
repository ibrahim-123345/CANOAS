import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaUserTie, 
  FaVoteYea,
  FaChartBar,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
  FaSearch,
  FaEllipsisH,
  FaEdit  // Add this line
} from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contestants');
  const [contestants, setContestants] = useState([]);
  const [voters, setVoters] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalContestants: 0,
    totalVoters: 0,
    totalVotes: 0,
    recentActivity: []
  });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchAllActivities();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contestants') {
        const res = await axios.get('http://localhost:8000/contestants');
        setContestants(res.data);
      } else if (activeTab === 'voters') {
        const res = await axios.get('http://localhost:8000/users');
        setVoters(res.data.filter(user => user.role === 'user'));
      } else if (activeTab === 'votes') {
        const res = await axios.get('http://localhost:8000/vote');
        setVotes(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [contestantsRes, votersRes, votesRes, activityRes] = await Promise.all([
        axios.get('http://localhost:8000/contestants'),
        axios.get('http://localhost:8000/users'),
        axios.get('http://localhost:8000/vote'),
        axios.get('http://localhost:8000/notifications?limit=5')
      ]);

      setStats({
        totalContestants: contestantsRes.data.length,
        totalVoters: votersRes.data.filter(user => user.role === 'user').length,
        totalVotes: votesRes.data.length,
        recentActivity: activityRes.data
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const res = await axios.get('http://localhost:8000/notifications');
      setAllActivities(res.data);
    } catch (err) {
      console.error('Error fetching all activities:', err);
    }
  };

  const handleDelete = (id, type) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${type}?`,
      buttons: [
        {
          label: 'Delete',
          onClick: async () => {
            try {
              setLoading(true);
              let endpoint = '';
              if (type === 'contestant') {
                endpoint = `http://localhost:8000/contestants/${id}`;
              } else if (type === 'voter') {
                endpoint = `http://localhost:8000/delete/${id}`;
              } else if (type === 'vote') {
                endpoint = `http://localhost:8000/vote/${id}`;
              }

              await axios.delete(endpoint);
              fetchData();
              fetchStats();
            } catch (err) {
              setError(err.response?.data?.message || 'Deletion failed');
            } finally {
              setLoading(false);
            }
          }
        },
        {
          label: 'Cancel'
        }
      ]
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    window.location.reload();
    navigate('/login');
  };

  const filteredData = () => {
    if (!searchTerm) {
      return activeTab === 'contestants' ? contestants : 
             activeTab === 'voters' ? voters : 
             votes;
    }

    const lowerSearch = searchTerm.toLowerCase();
    return (activeTab === 'contestants' ? contestants : 
            activeTab === 'voters' ? voters : 
            votes).filter(item => {
      if (activeTab === 'contestants') {
        return (
          item.name.toLowerCase().includes(lowerSearch) ||
          item.party.toLowerCase().includes(lowerSearch) ||
          item.position.toLowerCase().includes(lowerSearch))
      } else if (activeTab === 'voters') {
        return (
          item.fullName.toLowerCase().includes(lowerSearch) ||
          item.email.toLowerCase().includes(lowerSearch))
      } else if (activeTab === 'votes') {
        return (
          (item.contestant?.name || '').toLowerCase().includes(lowerSearch) ||
          (item.voter?.name || '').toLowerCase().includes(lowerSearch) ||
          item.voteValue.toLowerCase().includes(lowerSearch))
      }
      return true;
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav>
          <button 
            className={`nav-btn ${activeTab === 'contestants' ? 'active' : ''}`}
            onClick={() => setActiveTab('contestants')}
          >
            <FaUserTie /> Contestants
          </button>
          <button 
            className={`nav-btn ${activeTab === 'voters' ? 'active' : ''}`}
            onClick={() => setActiveTab('voters')}
          >
            <FaUsers /> Voters
          </button>
          <button 
            className={`nav-btn ${activeTab === 'votes' ? 'active' : ''}`}
            onClick={() => setActiveTab('votes')}
          >
            <FaVoteYea /> Votes
          </button>
          <Link to="/generalAnalysis" className="nav-btn">
            <FaChartBar /> Analytics
          </Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>
            {activeTab === 'contestants' && 'Manage Contestants'}
            {activeTab === 'voters' && 'Manage Voters'}
            {activeTab === 'votes' && 'Manage Votes'}
          </h1>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Contestants</h3>
              <p>{stats.totalContestants}</p>
            </div>
            <div className="stat-card">
              <h3>Voters</h3>
              <p>{stats.totalVoters}</p>
            </div>
            <div className="stat-card">
              <h3>Votes</h3>
              <p>{stats.totalVotes}</p>
            </div>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-input">
            <FaSearch />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'contestants' && (
            <Link to="/register-contestant" className="add-btn">
              <FaPlus /> Add Contestant
            </Link>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        <div className="table-container">
          {activeTab === 'contestants' && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Party</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData().map(contestant => (
                  <tr key={contestant._id}>
                    <td>
                      <div className="user-info">
                        <img 
                          src={contestant.profileImage || 'https://via.placeholder.com/40'} 
                          alt={contestant.name}
                        />
                        {contestant.name}
                      </div>
                    </td>
                    <td>{contestant.position}</td>
                    <td>{contestant.party}</td>
                    <td className="actions">
                     
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(contestant._id, 'contestant')}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'voters' && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData().map(voter => (
                  <tr key={voter._id}>
                    <td>
                      <div className="user-info">
                        <img 
                          src={voter.profileImage || 'http://localhost:8000/uploads/img_avatar.png'} 
                          alt={voter.fullName}
                        />
                        {voter.fullName}
                      </div>
                    </td>
                    <td>{voter.email}</td>
                    <td>{new Date(voter.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(voter._id, 'voter')}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'votes' && (
            <table>
              <thead>
                <tr>
                  <th>Contestant</th>
                  <th>Voter</th>
                  <th>Vote</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData().map(vote => (
                  <tr key={vote._id}>
                    <td>
                      {vote.contestant ? (
                        <div className="user-info">
                          <img 
                            src={vote.contestant.profileImage || 'https://via.placeholder.com/40'} 
                            alt={vote.contestant.name}
                          />
                          {vote.contestant.name}
                        </div>
                      ) : 'Deleted Contestant'}
                    </td>
                    <td>
                      {vote.voter ? (
                        <div className="user-info">
                          <img 
                            src={vote.voter.profileImage || 'https://via.placeholder.com/40'} 
                            alt={vote.voter.name}
                          />
                          {vote.voter.name}
                        </div>
                      ) : 'Deleted Voter'}
                    </td>
                    <td>
                      <span className={`vote-tag ${vote.voteValue}`}>
                        {vote.voteValue.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(vote.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(vote._id, 'vote')}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h2>Recent Activity</h2>
            <button 
              className="view-more-btn"
              onClick={() => setShowActivityModal(true)}
            >
              <FaEllipsisH />
            </button>
          </div>
          <ul>
            {stats.recentActivity.slice(0, 3).map(activity => (
              <li key={activity._id}>
                <p>{activity.message}</p>
                <span>{new Date(activity.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showActivityModal && (
        <div className="activity-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>All Activities</h2>
              <button 
                className="close-btn"
                onClick={() => setShowActivityModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <ul>
                {allActivities.map(activity => (
                  <li key={activity._id}>
                    <p>{activity.message}</p>
                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .sidebar {
          width: 250px;
          background: #2c3e50;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px 0;
          border-bottom: 1px solid #3d4f63;
          margin-bottom: 20px;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: none;
          border: none;
          color: #bdc3c7;
          text-align: left;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95rem;
          text-decoration: none;
        }

        .nav-btn:hover, .nav-btn.active {
          background: #34495e;
          color: white;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: auto;
          font-size: 0.95rem;
        }

        .main-content {
          flex: 1;
          padding: 30px;
          background: #f5f7fa;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .stats-container {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          flex: 1;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 1rem;
          color: #7f8c8d;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .search-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .search-input {
          display: flex;
          align-items: center;
          background: white;
          padding: 10px 15px;
          border-radius: 8px;
          width: 300px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .search-input input {
          border: none;
          outline: none;
          margin-left: 10px;
          width: 100%;
          font-size: 0.95rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #2c3e50;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.95rem;
        }

        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .loading {
          padding: 20px;
          text-align: center;
          color: #7f8c8d;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          color: #2c3e50;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-info img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .action-btn.edit {
          background: #d1fae5;
          color: #065f46;
        }

        .action-btn.delete {
          background: #fee2e2;
          color: #b91c1c;
        }

        .vote-tag {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .vote-tag.strong_approve {
          background: #d1fae5;
          color: #065f46;
        }

        .vote-tag.approve {
          background: #dcfce7;
          color: #166534;
        }

        .vote-tag.neutral {
          background: #e5e7eb;
          color: #374151;
        }

        .vote-tag.disapprove {
          background: #fef3c7;
          color: #92400e;
        }

        .vote-tag.strong_disapprove {
          background: #fee2e2;
          color: #991b1b;
        }

        .recent-activity {
          margin-top: 40px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .recent-activity h2 {
          margin: 0;
          font-size: 1.2rem;
          color: #2c3e50;
        }

        .view-more-btn {
          background: none;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          font-size: 1rem;
        }

        .recent-activity ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .recent-activity li {
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .recent-activity li:last-child {
          border-bottom: none;
        }

        .recent-activity p {
          margin: 0 0 5px 0;
          font-size: 0.95rem;
        }

        .recent-activity span {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .activity-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 80%;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
          color: #2c3e50;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #7f8c8d;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-body ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .modal-body li {
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .modal-body li:last-child {
          border-bottom: none;
        }

        .modal-body p {
          margin: 0 0 5px 0;
          font-size: 0.95rem;
        }

        .modal-body span {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            padding: 15px;
          }

          .main-content {
            padding: 20px;
          }

          .stats-container {
            flex-direction: column;
            gap: 10px;
          }

          .search-bar {
            flex-direction: column;
            gap: 10px;
          }

          .search-input {
            width: 100%;
          }

          .add-btn {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;