import React, { useState } from "react";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  const styles = {
    body: {
      backgroundColor: darkMode ? "#060707" : "#f0f0f0",
      color: darkMode ? "#ffffff" : "#050505",
      fontFamily: "Arial, sans-serif",
      margin: 0,
      padding: 0,
      transition: "all 0.4s ease-in-out",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      maxWidth: "800px",
      margin: "50px auto",
      padding: "40px",
      borderRadius: "20px",
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
      boxShadow: darkMode
        ? "0 0 25px rgba(255,255,255,0.05)"
        : "0 10px 40px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    heading: {
      fontSize: "2.5rem",
      marginBottom: "20px",
      fontWeight: "bold",
    },
    paragraph: {
      fontSize: "1.1rem",
      lineHeight: "1.8",
      textAlign: "justify",
      marginBottom: "30px",
    },
    button: {
      display: "inline-block",
      padding: "12px 25px",
      margin: "10px",
      background: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "30px",
      fontSize: "1rem",
      fontWeight: "bold",
      boxShadow: "0 5px 15px rgba(0,123,255,0.3)",
      cursor: "pointer",
      transition: "background 0.3s",
      textDecoration: "none",
    },
    buttonHover: {
      background: "#0056b3",
    },
    themeToggle: {
      marginTop: "15px",
      padding: "10px 18px",
      background: darkMode ? "#333" : "#444",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      borderRadius: "30px",
      fontSize: "0.95rem",
      fontWeight: "bold",
      transition: "all 0.3s",
    },
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Welcome to CANOAS</h1>
        <p style={styles.paragraph}>
          The platform for assessing election candidates accountably before voting day.
          <br />
          <br />
          The Candidate Online Assessment System (CANOAS) is an innovative platform
          designed to facilitate transparency, accountability, and citizen engagement
          in the electoral process. The system evaluates candidates' performance based
          on the promises made during their previous campaigns and provides an easy-to-use
          platform for both online voting and campaigning.
          <br />
          <br />
          Empowering voters to make informed decisions, CANOAS ensures transparency and
          meaningful engagement in democratic processes.
        </p>

        <a href="/login-signup" style={styles.button}>Login</a>
        <button onClick={toggleTheme} style={styles.themeToggle}>
          {darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
