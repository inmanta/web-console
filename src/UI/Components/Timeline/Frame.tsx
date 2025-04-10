import React from "react";
import { Icon, Spinner } from "@patternfly/react-core";
import { CheckCircleIcon, ExclamationCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Timestamp } from "./Timestamp";

interface FrameProps {
  started?: Timestamp;
  completed?: Timestamp;
  success?: boolean | null;
}

/**
 * A frame that represents the state of a request
 *
 * @param started - The time the request started
 * @param completed - The time the request completed
 * @param success - Whether the request was successful
 *
 * @returns {React.FC<FrameProps>} - A frame with the three states of a request
 */
export const Frame: React.FC<FrameProps> = ({ started, completed, success }) => {
  const DoneState = () => (
    <Icon aria-label="done-state" role="img" size="lg" status="success">
      <CheckCircleIcon />
    </Icon>
  );

  const LoadingState = () => <Spinner aria-label="loading-state" role="img" size="lg" />;

  const ErrorState = () => (
    <Icon aria-label="error-state" role="img" size="lg" status="danger">
      <ExclamationCircleIcon />
    </Icon>
  );

  const Requested = () => <DoneState />;

  const Started = () => {
    if (started) {
      return <DoneState />;
    } else {
      return <LoadingState />;
    }
  };

  const Completed = () => {
    if (completed && success) {
      return <DoneState />;
    } else if (completed && !success) {
      return <ErrorState />;
    } else {
      return <LoadingState />;
    }
  };

  return (
    <FrameContainer>
      <Requested />
      <Line />
      <Started />
      <Line />
      <Completed />
    </FrameContainer>
  );
};

const FrameContainer = styled.div`
  padding: 50px 50px 60px 50px;
  width: auto;
  display: flex;
  flex-direction: row;
`;

const Line = styled.div`
  width: 200px;
  height: 2px;
  background-color: var(--pf-t--global--border--color--nonstatus--gray--default);
  margin: 0 10px;
  transform: translateY(10px);
`;
