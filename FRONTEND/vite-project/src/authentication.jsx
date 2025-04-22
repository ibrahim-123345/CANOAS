import React, { useState } from "react";
import axios from "axios";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleForm = () => setIsLogin(!isLogin);
  const handleThemeToggle = () => setDarkMode(!darkMode);

  const login = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await axios.post("http://localhost:8000/login", payload);
      const data = res.data;
      alert("Login successful");
      // e.g. store token: localStorage.setItem("token", data.token);
      window.location.href = "/dashboard"; // redirect after login
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const signup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const payload = {
      name: form.name.value,
      email: form.email.value,
      password,
    };

    try {
      const res = await axios.post("http://localhost:7000/auth/signup", payload);
      const data = res.data;
      alert("Signup successful");
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      backgroundColor: darkMode ? "#121212" : "#f4f4f4",
      color: darkMode ? "#fff" : "#000",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.3s ease",
    },
    themeToggle: {
      position: "absolute",
      top: 20,
      right: 20,
      background: darkMode ? "#444" : "#ddd",
      padding: "8px 12px",
      borderRadius: "20px",
      fontSize: "14px",
    },
    formContainer: {
      width: "100%",
      maxWidth: "400px",
      padding: "30px",
      backgroundColor: darkMode ? "#1f1f1f" : "#fff",
      borderRadius: "12px",
      boxShadow: darkMode
        ? "0 0 10px rgba(255, 255, 255, 0.05)"
        : "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    heading: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "24px",
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      borderRadius: "8px",
      border: "1px solid #ccc",
      backgroundColor: darkMode ? "#2b2b2b" : "#fff",
      color: darkMode ? "#fff" : "#000",
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    switchLink: {
      textAlign: "center",
      marginTop: "15px",
      color: "#007bff",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.themeToggle}>
        <label>
          Dark Mode{" "}
          <input type="checkbox" checked={darkMode} onChange={handleThemeToggle} />
        </label>
      </div>

      <div style={styles.formContainer}>
        {isLogin ? (
          <>
            <h2 style={styles.heading}>Login</h2>
            <form onSubmit={login}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                style={styles.input}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Login
              </button>
            </form>
            <div style={styles.switchLink} onClick={toggleForm}>
              Don't have an account? Sign up
            </div>
          </>
        ) : (
          <>
            <h2 style={styles.heading}>Sign Up</h2>
            <form onSubmit={signup}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                style={styles.input}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                style={styles.input}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                style={styles.input}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                style={styles.input}
              />
              <button type="submit" style={styles.button}>
                Sign Up
              </button>
            </form>
            <div style={styles.switchLink} onClick={toggleForm}>
              Already have an account? Login
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
