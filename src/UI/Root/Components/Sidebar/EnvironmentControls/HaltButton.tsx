import React, { useContext } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

/**
 * `HaltButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const HaltButton: React.FC = () => {
  const { queryResolver, commandResolver } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
  const haltEnvironmentTrigger =
    commandResolver.useGetTrigger<"HaltEnvironment">({
      kind: "HaltEnvironment",
    });

  /**
   * Handles the toggling of the modal.
   *
   * This function triggers a modal with a title, details, and actions.
   * The actions include a confirmation button and a cancel button.
   * The confirmation button pauses all continuous managers, triggers the halt environment command, resumes all continuous managers, and dispatches a "halt-event".
   * The cancel button closes the modal.
   *
   * @returns {void}
   */
  const handleModalToggle = (): void => {
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
      <Button variant="stateful" state="attention" icon={<StopIcon />} onClick={handleModalToggle}>
        {words("environment.halt.button")}
      </Button>
    </Tooltip>
  );
};
