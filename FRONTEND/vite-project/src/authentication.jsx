import React, { useState } from "react";
import axios from "axios";

const AuthPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeToggle = () => setDarkMode(!darkMode);

  const login = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      email: form.email.value,
      password: form.password.value,
    };

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post("http://localhost:8000/login", payload);
      
      const status = res.status;
      const responseData = res.data;
      
      setMessage({
        text: `Success (${status}): ${responseData.message || "Login successful"}`,
        type: "success"
      });
         await axios.post(
          'http://localhost:8000/notifications',
          {
  "message":`user with email :${payload.email} is online`,
  "read": false
})

      
      
    
      if (responseData.tokenData) {
        localStorage.setItem("token", responseData.tokenData);
        console.log(localStorage.getItem("token"));
      }
      
      setTimeout(() => {
       window.location.href = "/vote";
      }, 1500);
      
    } catch (err) {
      let errorMessage = "An unexpected error occurred";
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        errorMessage = `Error (${status}): ${data.message || "Authentication failed"}`;
        
        if (status === 401) {
          errorMessage = "Unauthorized: Invalid credentials";
        } else if (status === 400) {
          errorMessage = "Bad Request: " + (data.message || "Invalid input");
        } else if (status === 404) {
          errorMessage = "Not Found: The requested resource doesn't exist";
        }
      } else if (err.request) {
        errorMessage = "Network Error: No response from server";
      } else {
        errorMessage = `Request Error: ${err.message}`;
      }
      
      setMessage({
        text: errorMessage,
        type: "error"
      });
      
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: "'Inter', sans-serif",
      backgroundColor: darkMode ? "#121212" : "#f8fafc",
      color: darkMode ? "#e2e8f0" : "#1e293b",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.3s ease",
      padding: "20px",
    },
    themeToggle: {
      position: "fixed",
      top: "20px",
      right: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "none",
      border: "none",
      color: darkMode ? "#e2e8f0" : "#1e293b",
      cursor: "pointer",
    },
    formContainer: {
      width: "100%",
      maxWidth: "400px",
      padding: "32px",
      backgroundColor: darkMode ? "#1e293b" : "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
    },
    heading: {
      textAlign: "center",
      marginBottom: "24px",
      fontSize: "24px",
      fontWeight: "600",
      color: darkMode ? "#f8fafc" : "#1e293b",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      margin: "8px 0 16px",
      borderRadius: "8px",
      border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
      backgroundColor: darkMode ? "#1e293b" : "#ffffff",
      color: darkMode ? "#f8fafc" : "#1e293b",
      fontSize: "14px",
      transition: "all 0.2s ease",
      outline: "none",
      ":focus": {
        borderColor: darkMode ? "#3b82f6" : "#2563eb",
        boxShadow: `0 0 0 3px ${darkMode ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.3)"}`,
      },
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "8px",
      backgroundColor: darkMode ? "#3b82f6" : "#2563eb",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: darkMode ? "#2563eb" : "#1d4ed8",
      },
      ":disabled": {
        opacity: "0.7",
        cursor: "not-allowed",
      },
    },
    registerLink: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "14px",
      color: darkMode ? "#94a3b8" : "#64748b",
    },
    registerAnchor: {
      color: darkMode ? "#60a5fa" : "#3b82f6",
      fontWeight: "500",
      textDecoration: "none",
      ":hover": {
        textDecoration: "underline",
      },
    },
    message: {
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "14px",
      textAlign: "center",
    },
    successMessage: {
      backgroundColor: darkMode ? "rgba(74, 222, 128, 0.1)" : "rgba(74, 222, 128, 0.2)",
      color: darkMode ? "#4ade80" : "#16a34a",
      border: `1px solid ${darkMode ? "rgba(74, 222, 128, 0.3)" : "rgba(74, 222, 128, 0.5)"}`,
    },
    errorMessage: {
      backgroundColor: darkMode ? "rgba(248, 113, 113, 0.1)" : "rgba(248, 113, 113, 0.2)",
      color: darkMode ? "#f87171" : "#dc2626",
      border: `1px solid ${darkMode ? "rgba(248, 113, 113, 0.3)" : "rgba(248, 113, 113, 0.5)"}`,
    },
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.themeToggle} 
        onClick={handleThemeToggle}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"} Mode
      </button>

      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Login</h2>
        
        {/* Status message display */}
        {message.text && (
          <div 
            style={{
              ...styles.message,
              ...(message.type === "success" ? styles.successMessage : styles.errorMessage)
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={login}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            style={styles.input}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            style={styles.input}
            autoComplete="current-password"
          />
          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.registerLink}>
          Don't have an account?{" "}
          <a 
            href="/Registration" 
            style={styles.registerAnchor}
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;