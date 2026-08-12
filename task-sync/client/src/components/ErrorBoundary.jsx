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
        <div className="main-content" style={{ textAlign: 'center' }}>
          <div className="panel" style={{ maxWidth: '520px', margin: '3rem auto' }}>
            <div className="panel-head">
              <span className="head-dot"></span>
              <span>Workspace Error</span>
            </div>
            <div className="panel-body">
              <h2 style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>Something went wrong in the workspace.</h2>
              <p className="task-desc">{this.state.error?.toString()}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn--primary"
                type="button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;