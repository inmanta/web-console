import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Button, Modal } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import React, { useContext, useState } from "react";
import styled from "styled-components";

interface Props {
  environment: string;
}

export const ResumeDialog: React.FC<Props> = ({ environment }) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  const resumeEnvironmentTrigger =
    commandResolver.getTrigger<"ResumeEnvironment">({
      kind: "ResumeEnvironment",
    });
  return (
    <>
      <GreenButton icon={<PlayIcon />} onClick={handleModalToggle}>
        {words("environment.resume.button")}
      </GreenButton>
      <Modal
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
        {words("environment.resume.details")(environment)}
      </Modal>
    </>
  );
};

const GreenButton = styled(Button)`
  && {
    background-color: var(--pf-global--success-color--100);
  }
`;
