import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={24} color="#E5484D" />
            </div>
            <h2 className="mb-2 text-foreground" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred while rendering this page. Reloading usually fixes it.
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
              style={{ background: "#4CAF68" }}
            >
              <RefreshCw size={15} /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
