import React from "react";
import { Bullseye } from "@patternfly/react-core";
import styled from "styled-components";
import { InlineSpinner } from "@/UI/Components";

export const LoadingIndicator: React.FC<{ progress: string }> = ({ progress }) => (
  <Bullseye style={{ paddingBottom: "24px" }}>
    <InlineSpinner size={24} /> <Progress>{progress}</Progress>
  </Bullseye>
);

const Progress = styled.span`
  line-height: 24px;
  font-size: 18px;
  margin-left: 16px;
`;
