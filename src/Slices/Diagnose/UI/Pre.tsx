import React from "react";
import styled from "styled-components";

export const Pre: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => <Container>{children}</Container>;

const Container = styled.pre`
  white-space: pre-wrap;
`;
