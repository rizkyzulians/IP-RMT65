
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");
  const [logoutMsg, setLogoutMsg] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setLogoutMsg("Logout berhasil! Anda telah keluar.");
    setTimeout(() => {
      setLogoutMsg("");
      navigate("/recipes");
    }, 1200);
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        zIndex: 101,
        background: 'linear-gradient(90deg, #f8ffec 60%, #ffe5b4 100%)',
        borderBottom: '3px solid #388e3c',
        boxShadow: '0 2px 8px #c8e6c9',
      }}
    >
      <div className="container-fluid">
        {logoutMsg && (
          <div className="alert alert-success text-center w-100 mb-0" style={{position:'fixed', top:60, left:0, zIndex:2000}}>
            {logoutMsg}
          </div>
        )}
        <Link to="/recipes" className="navbar-brand" style={{color:'#388e3c', fontWeight:700, fontSize:'1.5rem', letterSpacing:1, cursor:'pointer'}}>
          La Cusina App
        </Link>
        <ul className="navbar-nav d-flex flex-row align-items-center" style={{marginLeft: 16}}>
          <li className="nav-item">
            <Link
              to="/recipes"
              className="nav-link active"
              aria-current="page"
              style={{color:'#388e3c', fontWeight:600}}
            >
              Home
            </Link>
          </li>
          {accessToken && (
            <li className="nav-item" style={{marginLeft: 12}}>
              <Link
                to="/mylist"
                className="nav-link"
                style={{color:'#ff9800', fontWeight:600}}
              >
                My List
              </Link>
            </li>
          )}
        </ul>
        <div className="ms-auto d-flex align-items-center">
          {accessToken ? (
            <button
              onClick={handleLogout}
              className="btn rounded-pill"
              style={{background:'#388e3c', color:'#fff', fontWeight:600, minWidth:90}}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn rounded-pill" style={{background:'#ff9800', color:'#fff', fontWeight:600, minWidth:90}}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;