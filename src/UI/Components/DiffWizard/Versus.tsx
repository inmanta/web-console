import React from "react";
import { ArrowsAltHIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Diff } from "@/Core";

export const Versus: React.FC<Diff.Identifiers> = ({ from, to }) => (
  <VersusContainer>
    <IntroHeader>{from}</IntroHeader>
    <StyledIcon size="md" />
    <IntroHeader isTarget>{to}</IntroHeader>
  </VersusContainer>
);

const StyledIcon = styled(ArrowsAltHIcon)`
  flex-shrink: 0;
  height: 36px;
`;

const IntroHeader = styled.div<{ isTarget?: boolean }>`
  font-size: 21px;
  line-height: 36px;
  width: 100%;
  text-align: center;
  ${(p) => (p.isTarget ? "padding-right" : "padding-left")}: 12px;
`;

const VersusContainer = styled.div`
  display: flex;
  justify-content: center;
`;
