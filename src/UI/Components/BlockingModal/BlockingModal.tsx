import React, { useEffect, useState } from "react";
import { Flex, FlexItem, Modal, Spinner, Text } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

export const BlockingModal = () => {
  const [isBlockerOpen, setIsBlockerOpen] = useState(false);
  useEffect(() => {
    const toggleModal = () => {
      setIsBlockerOpen((state) => !state);
    };
    document.addEventListener("halt-event", toggleModal);
    return () => document.removeEventListener("halt-event", toggleModal);
  }, []);
  return (
    <StyledModal
      aria-label="halting-blocker"
      isOpen={isBlockerOpen}
      disableFocusTrap
      variant="small"
      showClose={false}
    >
      <Flex
        direction={{ default: "column" }}
        justifyContent={{ default: "justifyContentCenter" }}
        alignItems={{ default: "alignItemsCenter" }}
      >
        <FlexItem>
          <StyledText>{words("environment.halt.process")}</StyledText>
        </FlexItem>
        <FlexItem>
          <StyledSpinner size="lg" />
        </FlexItem>
      </Flex>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  background-color: transparent;
  box-shadow: none;
`;

const StyledSpinner = styled(Spinner)`
  --pf-v5-c-spinner--Color: var(--pf-v5-global--BackgroundColor--100);
`;

const StyledText = styled(Text)`
  color: var(--pf-v5-global--Color--light-100);
  font-size: 1rem;
  padding-bottom: 0.5rem;
  text-transform: uppercase;
`;
