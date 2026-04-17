import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Something went wrong while rendering the page.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary caught an error', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#e1e4f2] bg-white p-8 text-center shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f08a2c]">Application Error</p>
            <h1 className="mt-3 text-2xl font-semibold text-[#1d245d]">This screen hit an unexpected problem</h1>
            <p className="mt-3 text-sm leading-6 text-[#646b95]">
              {this.state.message || 'Please refresh the page and try again.'}
            </p>
            <button
              className="mt-6 inline-flex items-center justify-center rounded-md bg-[#08107b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#060b59]"
              onClick={this.handleReload}
              type="button"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
