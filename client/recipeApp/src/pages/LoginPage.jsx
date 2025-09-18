import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { serverSide } from "../helpers/httpClient";
import { useEffect } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await serverSide.post("/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/recipes");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  async function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    try {
      const res = await serverSide.post("/login/google", {
        id_token: response.credential,
      });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/recipes");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  useEffect(() => {
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" } // customization attributes
      );
    }
  }, [window.google]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        zIndex: -1,
  paddingTop: 64,
        boxSizing: 'border-box',
      }}
    >
      <form
        className="w-50 border p-5 rounded d-flex flex-column align-items-center"
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 2px 8px #c8e6c9",
          marginTop: 0,
        }}
      >
        <h1 style={{ color: "#388e3c" }}>Login</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
            required
          />
        </div>
        <p>
          Don't have an account yet? <Link to="/register">Register</Link>
        </p>
        <button
          type="submit"
          className="btn btn-success"
          style={{
            borderRadius: 20,
            fontWeight: 600,
            minWidth: 90,
            fontSize: "0.95rem",
          }}
        >
          Login
        </button>
        {/* Google Sign-In button below form, centered */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <div id="buttonDiv"></div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
