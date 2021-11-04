import React, { useState } from "react";
import { Description } from "@/UI/Components";
import { words } from "@/UI/words";
import styled from "styled-components";
import {
  Button,
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import {
  ClusterIcon,
  ProcessAutomationIcon,
  UserIcon,
} from "@patternfly/react-icons";

export const Tab: React.FC = () => {
  const [isAgentSelected, setIsAgentSelected] = useState(false);
  const [isApiSelected, setIsApiSelected] = useState(false);
  const [isCompilerSelected, setIsCompilerSelected] = useState(false);

  const onGenerate = () => {
    return undefined;
  };

  return (
    <Container>
      <Description>{words("settings.tabs.token.description")}</Description>
      <PaddedFlex>
        <FlexItem>
          <ToggleGroup aria-label="Icon variant toggle group">
            <ToggleGroupItem
              icon={<UserIcon />}
              text="agent"
              aria-label="AgentOption"
              isSelected={isAgentSelected}
              onChange={setIsAgentSelected}
            />
            <ToggleGroupItem
              icon={<ClusterIcon />}
              text="api"
              aria-label="ApiOption"
              isSelected={isApiSelected}
              onChange={setIsApiSelected}
            />
            <ToggleGroupItem
              icon={<ProcessAutomationIcon />}
              text="compiler"
              aria-label="CompilerOption"
              isSelected={isCompilerSelected}
              onChange={setIsCompilerSelected}
            />
          </ToggleGroup>
        </FlexItem>
        <FlexItem>
          <Button variant="primary" onClick={onGenerate}>
            {words("settings.tabs.token.generate")}
          </Button>
        </FlexItem>
      </PaddedFlex>
    </Container>
  );
};

const Container = styled.div`
  padding-top: 1rem;
`;

const PaddedFlex = styled(Flex)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;
