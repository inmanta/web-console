import React, { useContext } from "react";
import { Button, Icon, Tooltip } from "@patternfly/react-core";
import { PlayIcon } from "@patternfly/react-icons";
import { useResumeEnvironment } from "@/Data/Managers/V2/Environment";
import { useQueryControl } from "@/Data/Managers/V2/helpers/QueryControlContext";
import { words } from "@/UI/words";
import { ModalContext } from "../../ModalProvider";

/**
 * `ResumeButton` is a React functional component that renders a button with a tooltip.
 *
 * @returns {React.FC} A button with a tooltip that triggers a modal when clicked.
 */
export const ResumeButton: React.FC = () => {
  const { enableQueries } = useQueryControl();
  const { triggerModal, closeModal } = useContext(ModalContext);

  const { mutate } = useResumeEnvironment({
    onSuccess: () => {
      enableQueries();
      document.dispatchEvent(new CustomEvent("resume-event"));
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
          onClick={() => {
            mutate();
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
  );
};
