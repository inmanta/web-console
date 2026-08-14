import React, { useContext, useState } from "react";
import {
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { AgentsBulkAction, useAgentsAction } from "@/Data/Queries";
import { DependencyContext, words } from "@/UI";
import { ConfirmUserActionForm } from "@/UI/Components";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";

interface Props {
  /** Disables the whole dropdown, e.g. when there are no agents to act on. */
  isDisabled?: boolean;
}

/**
 * AgentsActionsButton - component that renders a dropdown with actions that apply to all agents
 * at once: pause, resume, set the on-resume behavior, and remove all agent venvs.
 *
 * Pause all/Resume all are disabled when the environment is halted, mirroring the per-agent
 * pause/unpause action. Keep paused on resume/Unpause on resume are only shown when the
 * environment is halted, mirroring the per-agent on-resume toggle, since they only affect
 * behavior on resume. Removing all agent venvs is asynchronous and can take a long time, so it
 * requires the user to confirm through a modal before firing the request.
 *
 * @props {Props} props - The properties for the AgentsActionsButton component.
 * @prop {boolean} [isDisabled] - Disables the whole dropdown, e.g. when there are no agents.
 *
 * @returns {React.FC} A dropdown button exposing the bulk agent actions.
 */
export const AgentsActionsButton: React.FC<Props> = ({ isDisabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { notifyInfo, notifyError } = useAppAlert();
  const isHalted = environmentHandler.useIsHalted();

  const { mutate } = useAgentsAction({
    onError: (error) => {
      notifyError({
        title: words("agents.actions.failed"),
        message: error.message,
      });
    },
  });

  const runAction = (action: AgentsBulkAction, requestedMessage: string): void => {
    setIsOpen(false);
    notifyInfo({
      title: words("info.title"),
      message: requestedMessage,
    });
    mutate({ action });
  };

  const openRemoveVenvsModal = (): void => {
    setIsOpen(false);
    triggerModal({
      title: words("agents.actions.removeAllVenvs.modal.title"),
      content: (
        <>
          <Content>{words("agents.actions.removeAllVenvs.confirmation.p1")}</Content>
          <Content>{words("agents.actions.removeAllVenvs.confirmation.p2")}</Content>
          <Content>{words("agents.actions.removeAllVenvs.confirmation.p3")}</Content>
          <ConfirmUserActionForm
            onSubmit={() => {
              closeModal();
              runAction("remove_all_agent_venvs", words("agents.actions.removeAllVenvs.requested"));
            }}
            onCancel={closeModal}
          />
        </>
      ),
    });
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      popperProps={{ position: "end" }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          variant="primary"
          aria-label={words("agents.actions.menu.label")}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          isDisabled={isDisabled}
        >
          {words("agents.actions.menu.label")}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          key="pause-all"
          isDisabled={isHalted}
          onClick={() => runAction("pause", words("agents.actions.pauseAll.requested"))}
        >
          {words("agents.actions.pauseAll")}
        </DropdownItem>
        <DropdownItem
          key="resume-all"
          isDisabled={isHalted}
          onClick={() => runAction("unpause", words("agents.actions.resumeAll.requested"))}
        >
          {words("agents.actions.resumeAll")}
        </DropdownItem>
        {isHalted && (
          <DropdownItem
            key="keep-paused-on-resume-all"
            onClick={() =>
              runAction(
                "keep_paused_on_resume",
                words("agents.actions.keepPausedOnResumeAll.requested")
              )
            }
          >
            {words("agents.actions.keepPausedOnResumeAll")}
          </DropdownItem>
        )}
        {isHalted && (
          <DropdownItem
            key="unpause-on-resume-all"
            onClick={() =>
              runAction("unpause_on_resume", words("agents.actions.unpauseOnResumeAll.requested"))
            }
          >
            {words("agents.actions.unpauseOnResumeAll")}
          </DropdownItem>
        )}
        <Divider key="divider" />
        <DropdownItem key="remove-all-venvs" onClick={openRemoveVenvsModal}>
          {words("agents.actions.removeAllVenvs")}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
