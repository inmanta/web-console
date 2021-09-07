import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Button, Modal } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import React, { useContext, useState } from "react";

export const HaltDialog: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  const haltEnvironmentTrigger = commandResolver.getTrigger<"HaltEnvironment">({
    kind: "HaltEnvironment",
  });
  return (
    <>
      <Button variant="danger" icon={<StopIcon />} onClick={handleModalToggle}>
        {words("environment.halt.button")}
      </Button>
      <Modal
        variant="small"
        title={words("environment.halt.title")}
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              haltEnvironmentTrigger();
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
        {words("environment.halt.details")}
      </Modal>
    </>
  );
};
