import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crash:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="panel">
          <h2>Something went wrong.</h2>
          <p className="error">{String(this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}