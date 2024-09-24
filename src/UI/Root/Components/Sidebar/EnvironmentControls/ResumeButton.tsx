import React, { useContext } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

export const ResumeButton: React.FC = () => {
  const { queryResolver, commandResolver } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);

  const resumeEnvironmentTrigger =
    commandResolver.useGetTrigger<"ResumeEnvironment">({
      kind: "ResumeEnvironment",
    });

  const handleModalToggle = () => {
    triggerModal({
      content: words("environment.resume.details"),
      title: words("environment.resume.title"),
      actions: [
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            resumeEnvironmentTrigger().then((_result) => {
              queryResolver.resumeAllContinuousManagers();
              document.dispatchEvent(new CustomEvent("resume-event"));
            });
            closeModal();
            document.dispatchEvent(new CustomEvent("resume-event"));
          }}
        >
          {words("yes")}
        </Button>,
        <Button key="cancel" variant="link" onClick={closeModal}>
          {words("no")}
        </Button>,
      ],
    });
  };

  return (
    <Tooltip
      content={<div>{words("environment.resume.tooltip")}</div>}
      position="right"
    >
      <GreenButton icon={<PlayIcon />} onClick={handleModalToggle}>
        {words("environment.resume.button")}
      </GreenButton>
    </Tooltip>
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-v5-global--success-color--100);
  }
`;
