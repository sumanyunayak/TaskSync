import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong in the workspace.</h2>
          <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary" 
            style={{ width: 'auto', marginTop: '1rem' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;