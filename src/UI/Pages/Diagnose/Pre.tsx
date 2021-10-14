import React from "react";
import styled from "styled-components";

export const Pre: React.FC = ({ children }) => (
  <Container>{children}</Container>
);

const Container = styled.pre`
  white-space: pre-wrap;
`;
