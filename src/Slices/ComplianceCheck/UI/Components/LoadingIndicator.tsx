import React from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";
import styled from "styled-components";

export const LoadingIndicator: React.FC<{ progress: string }> = ({
  progress,
}) => (
  <Bullseye style={{ paddingBottom: "24px" }}>
    <Spinner size="lg" /> <Progress>{progress}</Progress>
  </Bullseye>
);

const Progress = styled.span`
  line-height: 24px;
  font-size: 18px;
  margin-left: 16px;
`;
