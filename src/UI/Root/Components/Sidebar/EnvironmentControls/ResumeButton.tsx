import React, { useContext } from "react";
import { Button, Icon, Tooltip } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import { useResumeEnvironment } from "@/Data/Managers/V2/Environment/ResumeEnvironment";
import { useQueryControl } from "@/Data/Managers/V2/helpers/QueryControlContext";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

/**
 * `ResumeButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const ResumeButton: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { enableQueries } = useQueryControl();
  const { mutate, isPending } = useResumeEnvironment({
    onSuccess: () => {
      document.dispatchEvent(new CustomEvent("resume-event"));
      enableQueries();
      closeModal();
    },
  });

  /**
   * Handles the toggling of the modal.
   *
   * This function triggers a modal with a title, details, and actions.
   * The actions include a confirmation button and a cancel button.
   * The confirmation button triggers the resume environment command, resumes all continuous managers, and dispatches a "resume-event".
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
          isLoading={isPending}
          onClick={() => {
            mutate();
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
    <Tooltip content={words("environment.resume.tooltip")}>
      <Button
        variant="control"
        onClick={handleModalToggle}
        icon={
          <Icon status="success">
            <PlayIcon />
          </Icon>
        }
      >
        {words("environment.resume.button")}
      </Button>
    </Tooltip>
  );
};
