import React, { useEffect, useState } from "react";
import { Flex, FlexItem, Modal, Spinner, Text } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

export const BlockingModal = () => {
  const [isBlockerOpen, setIsBlockerOpen] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const toggleModalHalt = () => {
      setIsBlockerOpen((state) => !state);
      setMessage(words("environment.halt.process"));
    };
    const toggleModalResume = () => {
      setIsBlockerOpen((state) => !state);
      setMessage(words("environment.resume.process"));
    };

    document.addEventListener("halt-event", toggleModalHalt);
    document.addEventListener("resume-event", toggleModalResume);
    return () => {
      document.removeEventListener("halt-event", toggleModalHalt);
      document.removeEventListener("resume-event", toggleModalResume);
    };
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
          <StyledText>{message}</StyledText>
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
