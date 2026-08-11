import React, { useState } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 'Success') {
        if (isLogin) {
          onLoginSuccess(result.data);
        } else {
          setIsLogin(true);
          setError('Registration successful! Please log in.');
        }
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  return (
    <div className="form-card">
      <h2>{isLogin ? 'Login to TaskSync' : 'Create an Account'}</h2>
      {error && <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1.2rem' }}>
        {!isLogin && (
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
        {isLogin ? "Don't have an account? " : 'Already registered? '}
        <span
          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </span>
      </p>
    </div>
  );
}