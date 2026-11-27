import React, { useContext } from "react";
import { Button, Icon, Tooltip } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { words } from "@inmanta/web-console-core";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import { useResumeEnvironment } from "@inmanta/web-console-core/Queries/Slices/Environment";

/**
 * `ResumeButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const ResumeButton: React.FC = () => {
  const client = useQueryClient();
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { notifyError } = useAppAlert();

  const closeBlockingModal = () => {
    document.dispatchEvent(new CustomEvent("close-blocking-modal"));
  };

  const { mutate } = useResumeEnvironment({
    onSuccess: () => {
      client.refetchQueries();
      closeBlockingModal();
    },
    onError: (error) => {
      notifyError({
        title: words("error.title"),
        message: error.message,
      });
      closeBlockingModal();
    },
  });

  /**
   * Handles the toggling of the modal.
   *
   * This function triggers a modal with a title, details, and actions.
   * The actions include a confirmation button and a cancel button.
   * The confirmation button dispatches a "resume-event", which opens the blocking modal, and triggers the resume environment command.
   * The cancel button closes the modal.
   *
   * @returns {void}
   */
  const handleModalToggle = (): void => {
    triggerModal({
      content: words("environment.resume.details"),
      title: words("environment.resume.title"),
      actions: [
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            document.dispatchEvent(new CustomEvent("resume-event"));
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
          }}
        >
          {words("no")}
        </Button>,
      ],
    });
  };

  return (
    <>
      <Tooltip content={<div>{words("environment.resume.tooltip")}</div>} position="right">
        <Button
          icon={
            <Icon status="success">
              <PlayIcon />
            </Icon>
          }
          variant="control"
          onClick={handleModalToggle}
        >
          {words("environment.resume.button")}
        </Button>
      </Tooltip>
    </>
  );
};
