import React, { useContext, useState } from "react";
import { Button, Modal, Tooltip } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const ResumeDialog: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  const resumeEnvironmentTrigger =
    commandResolver.useGetTrigger<"ResumeEnvironment">({
      kind: "ResumeEnvironment",
    });
  return (
    <>
      <Tooltip
        content={<div>{words("environment.resume.tooltip")}</div>}
        position="right"
      >
        <GreenButton icon={<PlayIcon />} onClick={handleModalToggle}>
          {words("environment.resume.button")}
        </GreenButton>
      </Tooltip>
      <Modal
        disableFocusTrap
        variant="small"
        title={words("environment.resume.title")}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              resumeEnvironmentTrigger();
              handleModalToggle();
            }}
          >
            {words("yes")}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {words("no")}
          </Button>,
        ]}
      >
        {words("environment.resume.details")}
      </Modal>
    </>
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-v5-global--success-color--100);
  }
`;
