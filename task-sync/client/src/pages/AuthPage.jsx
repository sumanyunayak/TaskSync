import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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

    const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      <div className="panel-head">
        <span className="head-dot"></span>
        <span>{isLogin ? 'Member Access' : 'New Registration'}</span>
        <span className="spacer"></span>
        <span className="head-idx">{isLogin ? '// 01' : '// 02'}</span>
      </div>

      <div className="panel-body">
        <p className="form-copy">
          {isLogin
            ? 'Sign in to enter your TASKSYNC workspace.'
            : 'Stand up a new identity and start shipping.'}
        </p>

        {error && (
          <p className={error.includes('successful') ? 'form-success' : 'form-error'} role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="label" htmlFor="username">Username</label>
              <input
                className="field"
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="email">Email Address</label>
            <input
              className="field"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">Password</label>
            <input
              className="field"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--block">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="form-footer">
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <button
            type="button"
            className="link"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
