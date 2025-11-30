import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      alert('Signup successful. Please login.');
      navigate('/login');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength meter
  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();
  const strengthLabels = ['Weak', 'Okay', 'Good', 'Strong'];
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="auth-wrap">
      <div className="auth-grid">
        <div className="auth-illustration" aria-hidden="true">
          <img src="/images/signup.png" alt="Workspace" />
        </div>
        <Card className="auth-card">
          <div className="logo">Lockin</div>
          <h2 className="heading-xl" style={{ marginTop: 12 }}>Create Your Account</h2>
          <p className="subtle" style={{ marginTop: 6, marginBottom: 16 }}>Start your focused sessions today.</p>
          <Button type="button" variant="secondary" className="btn-block oauth-btn" onClick={() => alert('Google signup coming soon')}>Sign up with Google</Button>
          <div className="or-divider" style={{ marginTop: 12, marginBottom: 12 }}>OR</div>
          {error && <p className="error">{error}</p>}
          <form onSubmit={onSubmit} className="form-stack">
            <Input value={name} onChange={(e: any) => setName(e.target.value)} label="Name" required />
            <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} label="Email" required />
            <div>
              <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} label="Password" required minLength={8} helper="Use 8+ chars, with numbers or symbols." />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2,3].map((i) => (
                    <div key={i} style={{ width: 40, height: 6, borderRadius: 6, background: i < strength ? 'var(--primary)' : 'var(--border)' }} />
                  ))}
                </div>
                <small style={{ color: 'var(--text-muted)' }}>{strength ? strengthLabels[strength-1] : 'Weak'}</small>
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={accepted} onChange={(e: any) => setAccepted(e.target.checked)} />
              <span>By creating an account, you agree to our <Link to="/terms" className="link-muted">Terms of Service</Link> and <Link to="/privacy" className="link-muted">Privacy Policy</Link>.</span>
            </label>
            <Button type="submit" variant="primary" className="btn-block" disabled={loading || !accepted}>{loading ? 'Signing up…' : 'Sign Up'}</Button>
          </form>
          <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" className="link-muted">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
