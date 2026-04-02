import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-violet-50 px-6 py-16 text-violet-900">
          <div className="mx-auto max-w-xl rounded-3xl border border-violet-200 bg-white p-8 shadow-xl">
            <p className="mb-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              Something went wrong
            </p>
            <h1 className="title-font text-2xl font-bold">We hit an unexpected error.</h1>
            <p className="mt-3 text-sm text-violet-600">
              Your work is likely still saved on the server. Refresh to safely reconnect.
            </p>
            <button className="btn-primary mt-6" onClick={this.handleRefresh} type="button">
              Refresh app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
