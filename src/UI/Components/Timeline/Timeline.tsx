import React from "react";
import styled from "styled-components";
import { Frame } from "./Frame";
import {
  Timestamp,
  RequestedTimestampLabel,
  StartedTimestampLabel,
  CompletedTimestampLabel,
} from "./Timestamp";

interface Props {
  requested: Timestamp;
  requestedDiff: string;
  started?: Timestamp;
  startedDiff?: string;
  completed?: Timestamp;
  success?: boolean | null;
}

export const Timeline: React.FC<Props> = ({
  requested,
  requestedDiff,
  started,
  startedDiff,
  completed,
  success,
}) => (
  <Container>
    <RequestedLabel>Requested</RequestedLabel>
    <RequestedDiff>{requestedDiff}</RequestedDiff>
    <StartedLabel>Started</StartedLabel>
    {startedDiff && <StartedDiff>{startedDiff}</StartedDiff>}
    <CompletedLabel>Completed</CompletedLabel>
    <Frame started={started} completed={completed} success={success} />
    <RequestedTimestampLabel timestamp={requested} />
    {started && <StartedTimestampLabel timestamp={started} />}
    {completed && <CompletedTimestampLabel timestamp={completed} />}
  </Container>
);

const Container = styled.div`
  display: inline-block;
  position: relative;
`;

const Diff = styled.p`
  position: absolute;
  top: 41px;
  text-align: center;
  width: 200px;
  font-size: 14px;
`;

const RequestedDiff = styled(Diff)`
  left: 183px;
  transform: translateX(-50%);
`;

const StartedDiff = styled(Diff)`
  right: 183px;
  transform: translateX(50%);
`;

const Label = styled.p`
  position: absolute;
  font-size: 16px;
  font-weight: 600;
  top: 16px;
  text-align: center;
  width: 120px;
`;

const RequestedLabel = styled(Label)`
  left: 65px;
  transform: translateX(-50%);
`;

const StartedLabel = styled(Label)`
  left: 50%;
  transform: translateX(-50%);
`;

const CompletedLabel = styled(Label)`
  right: 65px;
  transform: translateX(50%);
`;
