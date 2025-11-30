import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, clearToken, getUser, clearUser } from '../../api';

const Navbar = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean>(!!getToken());
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>((getUser()?.name) || null);
  useEffect(() => {
    const id = setInterval(() => {
      setAuthed(!!getToken());
      setUserName(getUser()?.name || null);
    }, 750);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner" style={{ justifyContent: 'space-between' }}>
        <div className="navbar-brand">Lockin</div>
        <div className="nav-center" style={{ display: 'flex', gap: 'var(--m)', alignItems: 'center', margin: '0 auto' }}>
          <Link className="nav-link" to="/">Home</Link>
          {authed && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          <Link className="nav-link" to="/rooms">Rooms</Link>
        </div>
        <div className="nav-right" style={{ display: 'flex', gap: 'var(--m)', alignItems: 'center' }}>
          {!authed && <Link className="nav-link" to="/login">Login</Link>}
          {!authed && <Link className="nav-link" to="/signup">Signup</Link>}
          {authed && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                {(userName || 'Profile')}
              </button>
              {profileOpen && (
                <div
                  role="menu"
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, minWidth: 180, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ padding: '6px 8px', fontWeight: 600, borderBottom: '1px solid var(--border)', marginBottom: 6 }}>{userName || '—'}</div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      clearToken();
                      clearUser();
                      setAuthed(false);
                      setProfileOpen(false);
                      navigate('/');
                    }}
                  >Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
