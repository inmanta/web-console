import React from "react";
import { Icon, Spinner } from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
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
export const Frame: React.FC<FrameProps> = ({
  started,
  completed,
  success,
}) => {
  const DoneState = () => (
    <Icon aria-label="done-state" size="lg">
      <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" />
    </Icon>
  );

  const LoadingState = () => <Spinner aria-label="loading-state" size="lg" />;

  const ErrorState = () => (
    <Icon aria-label="error-state" size="lg">
      <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" />
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
  background-color: var(--pf-v5-global--BorderColor--100);
  margin: 0 10px;
  transform: translateY(10px);
`;
