import React, { useContext } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

export const HaltButton: React.FC = () => {
  const { queryResolver, commandResolver } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
  const haltEnvironmentTrigger =
    commandResolver.useGetTrigger<"HaltEnvironment">({
      kind: "HaltEnvironment",
    });

  const handleModalToggle = () => {
    triggerModal({
      content: words("environment.halt.details"),
      title: words("environment.halt.title"),
      actions: [
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            queryResolver.pauseAllContinuousManagers();
            haltEnvironmentTrigger().then((_result) => {
              queryResolver.resumeAllContinuousManagers();
              document.dispatchEvent(new CustomEvent("halt-event"));
            });
            closeModal();
            document.dispatchEvent(new CustomEvent("halt-event"));
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
      content={<div>{words("environment.halt.button.tooltip")}</div>}
      position="right"
    >
      <Button variant="danger" icon={<StopIcon />} onClick={handleModalToggle}>
        {words("environment.halt.button")}
      </Button>
    </Tooltip>
  );
};
