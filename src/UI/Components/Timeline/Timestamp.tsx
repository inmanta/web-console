import React from "react";
import styled from "styled-components";

export interface Timestamp {
  day: string;
  time: string;
}

interface Props {
  timestamp: Timestamp;
  className?: string;
}

const TimestampLabel: React.FC<Props> = ({ timestamp, className }) => (
  <TimestampContainer className={className}>
    <TimeLabel>{timestamp.time}</TimeLabel>
    <DayLabel>{timestamp.day}</DayLabel>
  </TimestampContainer>
);

const TimeLabel = styled.p`
  display: inline-block;
  font-weight: 600;
`;

const DayLabel = styled.p`
  display: inline-block;
  font-weight: 400;
`;

const TimestampContainer = styled.div`
  position: absolute;
  font-size: 14px;
  bottom: 8px;
  text-align: center;
  width: 100px;
`;

export const RequestedTimestampLabel = styled(TimestampLabel)`
  left: 65px;
  transform: translateX(-50%);
`;

export const StartedTimestampLabel = styled(TimestampLabel)`
  left: 50%;
  transform: translateX(-50%);
`;

export const CompletedTimestampLabel = styled(TimestampLabel)`
  right: 65px;
  transform: translateX(50%);
`;
