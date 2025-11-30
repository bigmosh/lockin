import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, setToken, setUser } from '../api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.access_token);
      setUser(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const [shake, setShake] = useState(false);
  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 300); };

  return (
    <div className="auth-wrap">
      <div className="auth-grid">
        <div className="auth-illustration" aria-hidden="true">
          <img src="/images/login.png" alt="Workspace" />
        </div>
        <Card className={`auth-card ${shake ? 'shake' : ''}`}>
            <div className="logo">Lockin</div>
            <h2 className="heading-xl" style={{ marginTop: 12 }}>Welcome Back</h2>
            <p className="subtle" style={{ marginTop: 6, marginBottom: 16 }}>Enter your credentials to access your account.</p>
            {error && <p className="error">{error}</p>}
            <form onSubmit={(e: any) => { onSubmit(e); if (error) triggerShake(); }} className="form-stack">
              <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} label="Email Address" required />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Password</span>
                  <Link to="#" className="link-muted" style={{ fontSize: 12 }}>Forgot Password?</Link>
                </div>
                <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} className="" required minLength={8} />
              </div>
              <Button type="submit" variant="primary" className="btn-block" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</Button>
            </form>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
              Don’t have an account? <Link to="/signup" className="link-muted">Sign Up</Link>
            </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
