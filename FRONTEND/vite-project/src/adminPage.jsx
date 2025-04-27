import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiUserPlus, FiPieChart, FiLogOut, FiSun, FiMoon,
  FiSettings, FiBarChart2, FiAward, FiShield, FiDatabase
} from 'react-icons/fi';
import { 
  FaVoteYea, FaUserTie, FaChartLine 
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    navigate('/auth');
  };

  const stats = [
    { title: "Total Users", value: "2,451", icon: <FiUsers size={24} />, change: "+12%", trend: 'up' },
    { title: "Active Voters", value: "1,892", icon: <FaVoteYea size={24} />, change: "+5.3%", trend: 'up' },
    { title: "Contestants", value: "47", icon: <FaUserTie size={24} />, change: "+3", trend: 'up' },
    { title: "Votes Cast", value: "8,742", icon: <FiBarChart2 size={24} />, change: "24.5%", trend: 'up' }
  ];

  const recentActivities = [
    { id: 1, action: "New contestant registered", user: "Sarah Johnson", time: "5 mins ago" },
    { id: 2, action: "User account created", user: "michael.lee@example.com", time: "23 mins ago" },
    { id: 3, action: "System update completed", user: "v2.1.5", time: "1 hour ago" },
    { id: 4, action: "Security audit passed", user: "Admin", time: "2 hours ago" }
  ];

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0f0f13' : '#f8fafc',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden'
    },
    sidebar: {
      width: '280px',
      backgroundColor: darkMode ? '#15151a' : '#ffffff',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRight: darkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0',
      boxShadow: darkMode ? 'none' : '4px 0 20px rgba(0,0,0,0.03)'
    },
    mainContent: {
      flexGrow: 1,
      padding: '2rem 3rem',
      overflowY: 'auto',
      background: darkMode ? 'radial-gradient(circle at top right, #1a1a24 0%, #0f0f13 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: darkMode ? '#a0a0b0' : '#64748b',
      textDecoration: 'none',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ':hover': {
        backgroundColor: darkMode ? '#252532' : '#f1f5f9',
        color: darkMode ? '#ffffff' : '#1e293b'
      },
    },
    activeLink: {
      backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: darkMode ? '#a0a0b0' : '#64748b',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: darkMode ? '#252532' : '#f1f5f9',
        color: darkMode ? '#ffffff' : '#1e293b'
      },
    },
    themeButton: {
      padding: '0.5rem 1rem',
      backgroundColor: darkMode ? '#252532' : '#e2e8f0',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: darkMode ? '#3b82f6' : '#2563eb',
        color: '#ffffff'
      },
    },
    statCard: {
      backgroundColor: darkMode ? '#1e1e28' : '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      border: darkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0'
    },
    activityCard: {
      backgroundColor: darkMode ? '#1e1e28' : '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.05)',
      marginBottom: '1.5rem',
      border: darkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0'
    },
    chartContainer: {
      backgroundColor: darkMode ? '#1e1e28' : '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: darkMode ? '0 4px 24px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.05)',
      border: darkMode ? '1px solid #2d2d3a' : '1px solid #e2e8f0'
    }
  };

  return (
    <div style={styles.container}>
      {/* Premium Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '2rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            background: darkMode ? 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)' : 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
            color: 'white'
          }}>
            <FiShield size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Admin Console</h2>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={styles.themeButton}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <a 
            href="#" 
            onClick={() => setActiveTab('dashboard')}
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'dashboard' ? styles.activeLink : {}) 
            }}
          >
            <FiPieChart size={20} /> Dashboard
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab('contestants')}
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'contestants' ? styles.activeLink : {}) 
            }}
          >
            <FaUserTie size={20} /> Contestants
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab('users')}
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'users' ? styles.activeLink : {}) 
            }}
          >
            <FiUsers size={20} /> User Management
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab('analytics')}
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'analytics' ? styles.activeLink : {}) 
            }}
          >
            <FaChartLine size={20} /> Analytics
          </a>
          <a 
            href="#" 
            onClick={() => setActiveTab('settings')}
            style={{ 
              ...styles.navLink, 
              ...(activeTab === 'settings' ? styles.activeLink : {}) 
            }}
          >
            <FiSettings size={20} /> System Settings
          </a>
        </div>
        
        <div>
          <div style={{ 
            ...styles.statCard, 
            marginBottom: '1.5rem',
            background: darkMode ? 'linear-gradient(135deg, #1e1e28 0%, #252532 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiDatabase size={18} color={darkMode ? '#3b82f6' : '#2563eb'} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: darkMode ? '#a0a0b0' : '#64748b' }}>System Status</p>
                <p style={{ margin: 0, fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>All Systems Normal</p>
              </div>
            </div>
          </div>
          
          <button onClick={handleLogout} style={styles.logoutButton}>
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.75rem', 
            fontWeight: '700',
            background: darkMode ? 'linear-gradient(90deg, #ffffff 0%, #a0a0b0 100%)' : 'linear-gradient(90deg, #1e293b 0%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Administrator Dashboard
          </h1>
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: darkMode ? '#252532' : '#e2e8f0',
            color: darkMode ? '#a0a0b0' : '#64748b',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            Super Admin Access
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ 
              ...styles.statCard,
              borderLeft: `4px solid ${darkMode ? '#3b82f6' : '#2563eb'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem', 
                    color: darkMode ? '#a0a0b0' : '#64748b',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.title}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    color: darkMode ? '#ffffff' : '#1e293b'
                  }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ 
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ 
                  color: stat.trend === 'up' ? (darkMode ? '#10b981' : '#059669') : (darkMode ? '#ef4444' : '#dc2626'),
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {stat.change}
                </span>
                <span style={{ 
                  color: darkMode ? '#a0a0b0' : '#64748b',
                  fontSize: '0.75rem'
                }}>
                  vs last week
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Activities Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Chart Container */}
          <div style={styles.chartContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Voting Activity</h3>
              <div style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: darkMode ? '#252532' : '#e2e8f0',
                color: darkMode ? '#a0a0b0' : '#64748b',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Last 30 Days
              </div>
            </div>
            <div style={{ 
              height: '300px', 
              background: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: darkMode ? '#a0a0b0' : '#64748b'
            }}>
              <p>Voting activity chart visualization</p>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div style={styles.activityCard}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivities.map(activity => (
                <div key={activity.id} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FiAward size={16} color={darkMode ? '#3b82f6' : '#2563eb'} />
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#ffffff' : '#1e293b'
                    }}>
                      {activity.action}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.75rem',
                      color: darkMode ? '#a0a0b0' : '#64748b'
                    }}>
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;