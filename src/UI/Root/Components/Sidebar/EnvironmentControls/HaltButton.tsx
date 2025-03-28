import React, { useContext } from "react";
import { Button, Tooltip } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import { useHaltEnvironment } from "@/Data/Managers/V2/Environment/HaltEnvironment";
import { useQueryControl } from "@/Data/Managers/V2/helpers/QueryControlContext";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

/**
 * `HaltButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const HaltButton: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { disableQueries } = useQueryControl();
  const { mutate, isPending } = useHaltEnvironment({
    onSuccess: () => {
      document.dispatchEvent(new CustomEvent("halt-event"));
      disableQueries();
      closeModal();
    },
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
            mutate();
          }}
          isLoading={isPending}
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
    <Tooltip content={words("environment.halt.tooltip")}>
      <Button
        variant="secondary"
        onClick={handleModalToggle}
        icon={<StopIcon />}
      >
        {words("environment.halt.button")}
      </Button>
    </Tooltip>
  );
};
