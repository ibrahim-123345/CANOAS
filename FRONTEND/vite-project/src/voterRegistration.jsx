import React, { useState } from "react";
import axios from "axios";

const RegisterUserForm = () => {
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    NIDA: "",
    email: "",
    password: "",
  });

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/register", formData);
      alert("User registered successfully!");
      window.location.href = "/login"; 
      setFormData({ fullName: "", NIDA: "", email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const styles = {
    page: {
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: darkMode ? "#121212" : "#f2f4f8",
      color: darkMode ? "#fff" : "#333",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.3s ease",
    },
    card: {
      backgroundColor: darkMode ? "#1e1e2f" : "#ffffff",
      padding: "40px",
      borderRadius: "16px",
      boxShadow: darkMode
        ? "0 0 20px rgba(255,255,255,0.08)"
        : "0 10px 30px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "450px",
    },
    title: {
      fontSize: "26px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "24px",
    },
    input: {
      width: "100%",
      padding: "14px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "10px",
      fontSize: "15px",
      backgroundColor: darkMode ? "#2c2c3b" : "#f9f9f9",
      color: darkMode ? "#fff" : "#000",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "20px",
    },
    themeToggle: {
      position: "absolute",
      top: "20px",
      right: "20px",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.themeToggle}>
        <label>
          <input type="checkbox" checked={darkMode} onChange={toggleTheme} />{" "}
          Dark Mode
        </label>
      </div>

      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.title}>Register User</div>

        <input
          style={styles.input}
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="text"
          name="NIDA"
          placeholder="NIDA Number"
          value={formData.NIDA}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button style={styles.button} type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterUserForm;
