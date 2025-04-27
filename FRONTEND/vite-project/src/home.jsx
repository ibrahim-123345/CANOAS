import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaUserTie, FaVoteYea } from "react-icons/fa";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleNavigation = (path) => {
    navigate(path);
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/auth';
    setIsAuthenticated(false);
  };

  const styles = {
    body: {
      backgroundColor: darkMode ? "#121212" : "#f8f9fa",
      color: darkMode ? "#e0e0e0" : "#333333",
      fontFamily: "'Inter', sans-serif",
      margin: 0,
      padding: 0,
      transition: "all 0.4s ease-in-out",
      minHeight: "100vh",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "60px",
    },
    title: {
      fontSize: "2.8rem",
      fontWeight: "800",
      background: darkMode 
        ? "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)" 
        : "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    },
    themeToggle: {
      background: darkMode ? "#333" : "#e2e8f0",
      color: darkMode ? "#fff" : "#333",
      border: "none",
      padding: "12px 20px",
      borderRadius: "50px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "600",
      boxShadow: darkMode 
        ? "0 4px 15px rgba(0, 0, 0, 0.2)" 
        : "0 4px 15px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    hero: {
      textAlign: "center",
      marginBottom: "80px",
    },
    heroText: {
      fontSize: "1.2rem",
      lineHeight: "1.8",
      maxWidth: "800px",
      margin: "0 auto 40px",
      color: darkMode ? "#b0b0b0" : "#555",
    },
    features: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "30px",
      marginBottom: "60px",
    },
    featureCard: {
      background: darkMode ? "#1e1e1e" : "#ffffff",
      borderRadius: "16px",
      padding: "30px",
      boxShadow: darkMode 
        ? "0 8px 30px rgba(0, 0, 0, 0.2)" 
        : "0 8px 30px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease",
      textAlign: "center",
    },
    featureIcon: {
      fontSize: "2.5rem",
      marginBottom: "20px",
      color: darkMode ? "#4facfe" : "#2563eb",
    },
    featureTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      marginBottom: "15px",
    },
    featureDesc: {
      color: darkMode ? "#a0a0a0" : "#666",
      lineHeight: "1.6",
    },
    ctaSection: {
      textAlign: "center",
      marginTop: "60px",
    },
    ctaButton: {
      background: darkMode ? "#4facfe" : "#2563eb",
      color: "white",
      border: "none",
      padding: "16px 32px",
      borderRadius: "50px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: darkMode 
        ? "0 5px 20px rgba(79, 172, 254, 0.3)" 
        : "0 5px 20px rgba(37, 99, 235, 0.3)",
      transition: "all 0.3s ease",
      margin: "0 10px",
    },
    secondaryButton: {
      background: "transparent",
      color: darkMode ? "#4facfe" : "#2563eb",
      border: `2px solid ${darkMode ? "#4facfe" : "#2563eb"}`,
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>CANOAS</h1>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div style={styles.hero}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "700", 
            marginBottom: "20px" 
          }}>
            {isAuthenticated ? 'Welcome Back!' : 'Candidate Online Assessment System'}
          </h2>
          <p style={styles.heroText}>
            {isAuthenticated
              ? 'Continue your journey in making informed voting decisions with our comprehensive candidate evaluation platform.'
              : 'Empowering voters with transparent candidate assessments to make informed decisions in democratic processes.'}
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <FaUserTie />
            </div>
            <h3 style={styles.featureTitle}>Candidate Profiles</h3>
            <p style={styles.featureDesc}>
              Comprehensive profiles with detailed information about each candidate's background and promises.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <FaVoteYea />
            </div>
            <h3 style={styles.featureTitle}>Transparent Voting</h3>
            <p style={styles.featureDesc}>
              Secure and verifiable voting system that ensures your voice is heard in the democratic process.
            </p>
          </div>
        </div>

        <div style={styles.ctaSection}>
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => handleNavigation('/vote')} 
                style={styles.ctaButton}
              >
                Go back to Dashboard
              </button>
              <button 
                onClick={() => handleLogout()} 
                style={{ ...styles.ctaButton, ...styles.secondaryButton }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleNavigation('/auth')} 
              style={styles.ctaButton}
            >
              Let's Get You Started by Logging In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;