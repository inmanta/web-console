import React, { useContext, useState } from "react";
import { Button, Divider, DrilldownMenu, MenuItem, Content } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { usePostExpertStateTransfer } from "@/Data/Managers/V2/ServiceInstance";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ToastAlertMessage } from "../../ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
  availableStates: string[];
}

/**
 * ForceStateAction is a component that allows the user to force a state on a service instance.
 * @props {Props} props - The props of the component.
 *  @prop {string} service_entity - The service entity of the service instance.
 *  @prop {string} id - The id of the service instance.
 *  @prop {string} instance_identity - The instance identity of the service instance.
 *  @prop {string} version - The version of the service instance.
 *  @prop {string[]} availableStates - The available states of the service instance.
 *  @prop {string} insetHeight - The inset height of the service instance.
 *
 * @returns {React.FC<Props>} A React component that allows the user to force a state on a service instance.
 */
export const ForceStateAction: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  availableStates,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");

  const menuItems = availableStates.sort().map((target) => (
    <MenuItem
      key={target}
      value={target}
      data-testid={`${id}-${target}-expert`}
      onClick={() => onSelect(target)}
    >
      {target}
    </MenuItem>
  ));

  const { authHelper, environmentHandler } = useContext(DependencyContext);

  const { mutate } = usePostExpertStateTransfer(id, service_entity, {
    onError: (error) => {
      setStateErrorMessage(error.message);
    },
  });

  const isHalted = environmentHandler.useIsHalted();

  /**
   * Opens a modal with confirmation buttons.
   * @param {string} targetState - The target state to be used in the operation.

   *
   * @returns {void}
   */
  const openModal = (targetState: string): void => {
    /**
     * Handles the submission of the force state action.
     *
     * @returns {Promise<void>} A Promise that resolves when the operation is complete.
     */
    const onSubmit = async () => {
      closeModal();

      const username = authHelper.getUser();
      const message = words("instanceDetails.API.message.update")(username);

      mutate({
        message: message,
        current_version: version,
        target_state: targetState,
      });
    };

    triggerModal({
      title: words("inventory.statustab.forceState.confirmTitle"),
      iconVariant: "danger",
      actions: [
        <Button
          key="confirm"
          variant="danger"
          data-testid={`${id}-state-modal-confirm`}
          onClick={onSubmit}
        >
          {words("yes")}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          data-testid={`${id}-state-modal-cancel`}
          onClick={closeModal}
        >
          {words("no")}
        </Button>,
      ],
      content: (
        <>
          <Content component="p">
            {words("inventory.statustab.forceState.message")(instance_identity, targetState)}
          </Content>
          <br />
          <Content component="p">{words("inventory.statustab.forceState.confirmMessage")}</Content>
          <Content component="p">{words("inventory.statustab.forceState.confirmQuestion")}</Content>
        </>
      ),
    });
  };

  /**
   * Handles the selection of the state.
   * @param {string} value - The target state to be used in the operation.
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSelect = (value: string) => {
    openModal(value);
  };

  return (
    <>
      {stateErrorMessage && (
        <ToastAlertMessage
          stateErrorMessage={stateErrorMessage}
          id={id}
          setStateErrorMessage={setStateErrorMessage}
        />
      )}
      <ActionDisabledTooltip
        testingId={words("inventory.statustab.forceState")}
        tooltipContent={
          isHalted ? words("environment.halt.tooltip") : words("inventory.statustab.actionDisabled")
        }
      >
        <MenuItem
          isDanger
          itemId="group:expertstate"
          data-testid="forceState"
          icon={<WarningTriangleIcon />}
          direction="down"
          style={{
            backgroundColor: "var(--pf-t--global--color--nonstatus--red--default)",
          }}
          drilldownMenu={
            <DrilldownMenu id="drilldownMenuExpertState" aria-label="drilldownMenuExpertState">
              <MenuItem
                style={{
                  backgroundColor: "var(--pf-t--global--color--nonstatus--red--default)",
                }}
                icon={<WarningTriangleIcon />}
                itemId="group:expertstate_breadcrumb"
                direction="up"
                aria-hidden
                isDanger
              >
                Force state to:
              </MenuItem>
              <Divider component="li" />
              {menuItems}
            </DrilldownMenu>
          }
        >
          Force State
        </MenuItem>
      </ActionDisabledTooltip>
    </>
  );
};
