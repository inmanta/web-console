import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { ArrowsAltHIcon } from "@patternfly/react-icons";
import styled from "styled-components";

export const Intro: React.FC<{ source: string; target: string }> = ({
  source,
  target,
}) => (
  <IntroContainer>
    <GridItem span={2} />
    <GridItem span={10}>
      <VersusContainer>
        <IntroHeader>{source}</IntroHeader>
        <StyledIcon size="md" />
        <IntroHeader isTarget>{target}</IntroHeader>
      </VersusContainer>
    </GridItem>
  </IntroContainer>
);

const StyledIcon = styled(ArrowsAltHIcon)`
  flex-shrink: 0;
  height: 30px;
`;

const IntroHeader = styled.div<{ isTarget?: boolean }>`
  font-size: 21px;
  line-height: 30px;
  width: 100%;
  text-align: center;
  ${(p) => (p.isTarget ? "padding-right" : "padding-left")}: 12px;
`;

const IntroContainer = styled(Grid)`
  padding: 16px 0;
`;

const VersusContainer = styled.div`
  display: flex;
  justify-content: center;
`;
