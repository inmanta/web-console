import React, { useContext, useState } from "react";
import { Alert, AlertGroup, Button, Tooltip } from "@patternfly/react-core";
import { StopIcon } from "@patternfly/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { uniqueId } from "lodash";
import { useHaltEnvironment } from "@/Data/Queries";
import { useQueryControl } from "@/Data/Queries";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

/**
 * `HaltButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const HaltButton: React.FC = () => {
  const client = useQueryClient();
  const { disableQueries, enableQueries } = useQueryControl();
  const { triggerModal, closeModal } = useContext(ModalContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate } = useHaltEnvironment({
    onSuccess: () => {
      client.refetchQueries();
      enableQueries();
      closeModal();
      document.dispatchEvent(new CustomEvent("halt-event"));
    },
    onError: (error) => {
      setErrorMessage(error.message);
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
            disableQueries();
            mutate();
          }}
        >
          {words("yes")}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            closeModal();
            setErrorMessage(null);
          }}
        >
          {words("no")}
        </Button>,
      ],
    });
  };

  return (
    <>
      <Tooltip content={<div>{words("environment.halt.button.tooltip")}</div>} position="right">
        <Button
          variant="stateful"
          state="attention"
          icon={<StopIcon />}
          onClick={handleModalToggle}
        >
          {words("environment.halt.button")}
        </Button>
      </Tooltip>
      {errorMessage && (
        <AlertGroup aria-live="polite" isToast>
          <Alert
            variant="danger"
            title={words("error.title")}
            key={"error-" + uniqueId()}
            timeout={5000}
            aria-label="error-message"
          >
            {errorMessage}
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};
