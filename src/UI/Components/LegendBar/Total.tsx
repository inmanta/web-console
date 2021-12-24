import React from "react";
import { Tooltip } from "@patternfly/react-core";
import styled from "styled-components";

export interface Total {
  format(total: number): string;
  label?: string;
}

const TotalContainer = styled.div`
  padding: 0 16px;
  line-height: 36px;
`;

export const Total: React.FC<{ total: Total; value: number }> = ({
  total,
  value,
}) =>
  total.label ? (
    <Tooltip content={total.label} position="auto" distance={4} enableFlip>
      <TotalContainer>{total.format(value)}</TotalContainer>
    </Tooltip>
  ) : (
    <TotalContainer>{total.format(value)}</TotalContainer>
  );
