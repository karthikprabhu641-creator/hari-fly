import React, { Component } from 'react';
import { GameView } from './components/GameView';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Hari.fly UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#090d16',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            textAlign: 'center',
            fontFamily: 'sans-serif',
            zIndex: 9999,
          }}
        >
          <h2>Game Interface Notice</h2>
          <p style={{ color: '#94a3b8', margin: '10px 0 20px' }}>
            {this.state.error?.message || 'An error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#b7e45b',
              color: '#0d1f0d',
              fontWeight: 'bold',
              border: 0,
              cursor: 'pointer',
            }}
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <GameView />
    </ErrorBoundary>
  );
}

export default App;
