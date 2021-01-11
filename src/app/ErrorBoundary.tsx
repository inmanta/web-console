import * as React from "react";

interface State {
  hasError: boolean;
}

type Props = React.PropsWithChildren<Record<string, unknown>>;

export class ErrorBoundary extends React.Component<Props, State> {
  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <div> Something happened</div>;
    }

    return this.props.children;
  }
}
