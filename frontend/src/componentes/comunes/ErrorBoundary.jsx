import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    // Si hay error, renderizamos sólo los children sin el proveedor problemático
    if (this.state.hasError) {
      return this.props.fallback ? this.props.fallback : this.props.children;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
