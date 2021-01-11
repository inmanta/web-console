import * as React from "react";

export class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  public static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div> Something happened</div>;
    }

    return this.props.children;
  }
}
