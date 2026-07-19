import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary for handling UI runtime exceptions gracefully.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log exception to error reporter
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <ErrorState
            title="UI Runtime Error"
            message={this.state.error?.message || 'An unexpected error occurred.'}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
