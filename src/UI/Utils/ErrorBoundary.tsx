import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, ClipboardCopy } from "@patternfly/react-core";
import styled from "styled-components";
import { ErrorView } from "../Components";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/** ErrorBoundary component needs to be a Class,
 *  since React hasn't implemented a Hook yet for the componentDidCatch lifecycle.
 *  Check https://reactjs.org/docs/error-boundaries.html for more information.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          <ErrorView
            message={
              this.state.error?.message || "Something unexpected happened."
            }
          ></ErrorView>
          <this.StyledClipboardContainer>
            <ClipboardCopy
              isCode
              isExpanded
              variant={"expansion"}
              isReadOnly
              hoverTip="Copy"
              clickTip="Copied"
            >
              {this.state.error?.stack ||
                "We couldn't retrieve the error trace."}
            </ClipboardCopy>
            <this.StyledCenteredContainer>
              <Button variant="primary" onClick={() => location.reload()}>
                Reload the page
              </Button>
              <this.StyledParagraph>
                If this error keeps happening, please contact{" "}
                <a href="mailto:support@inmanta.com">support@inmanta.com</a> for
                more assistance.
              </this.StyledParagraph>
            </this.StyledCenteredContainer>
          </this.StyledClipboardContainer>
        </React.Fragment>
      );
    }

    return this.props.children;
  }

  public StyledClipboardContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
  `;
  public StyledCenteredContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-direction: column;
    margin-top: 20px;
  `;
  public StyledParagraph = styled.p`
    font-style: italic;
    color: var(--pf-global--palette--blue-400);
  `;
}

export default ErrorBoundary;
