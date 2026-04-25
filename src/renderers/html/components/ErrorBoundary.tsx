import React from 'react';

interface State { error: Error | null }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <span className="md4ai-error" title={this.state.error.message}>
          [render error]
        </span>
      );
    }
    return this.props.children;
  }
}
