import React from "react";
import styled from "styled-components";

interface Props {
  singleLine?: boolean;
  children: string;
}

export const CodeText: React.FC<Props> = ({ children, singleLine = false }) => (
  <StyledPre singleLine={singleLine}>
    <code>{children}</code>
  </StyledPre>
);

const StyledPre = styled.pre<{ singleLine: boolean }>`
  white-space: ${(p) => (p.singleLine ? "nowrap" : "pre-wrap")};
  ${({ singleLine }) =>
    singleLine ? "overflow: hidden; text-overflow: ellipsis;" : ""}
  font-family: "Liberation Mono";
`;
