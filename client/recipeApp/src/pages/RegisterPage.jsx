import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { serverSide } from "../helpers/httpClient";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await serverSide.post("/register", { name, email, password });
      setSuccess("Register success! Please login.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      zIndex: -1,
      paddingTop: '70px',
    }}>
      <form
        className="w-50 border p-5 rounded"
        onSubmit={handleSubmit}
        style={{
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 8px #c8e6c9',
        }}
      >
      <h1 style={{color:'#388e3c'}}>Register</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          type="text"
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Email address</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          className="form-control"
          required
        />
      </div>
      <p>
        Do you have an account? <Link to="/login">Login</Link>
      </p>
      <button type="submit" className="btn btn-success" style={{borderRadius:20, fontWeight:600, minWidth:90, fontSize:'0.95rem'}}>
        Register
      </button>
      </form>
    </div>
  );
}

export default RegisterPage;