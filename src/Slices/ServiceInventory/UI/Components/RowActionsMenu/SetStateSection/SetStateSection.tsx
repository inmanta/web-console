import React, { useContext } from "react";
import { Button, MenuItem, Content } from "@patternfly/react-core";
import styled, { css } from "styled-components";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { usePostStateTransfer } from "@/Data/Queries";
import { StateTarget, iconColorFor } from "@/Slices/ServiceInstanceDetails/Utils";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";

interface Props extends VersionedServiceInstanceIdentifier {
  targets: StateTarget[] | null;
  instance_identity: string;
  onClose: () => void;
}

/**
 * SetStateSection is a component that allows the user to set a state on a service instance.
 *
 * @props {Props} props - The props of the component.
 * @prop {string} service_entity - The service entity of the service instance.
 * @prop {string} id - The id of the service instance.
 * @prop {string} instance_identity - The instance identity of the service instance.
 * @prop {string} version - The version of the service instance.
 * @prop {StateTarget[]} targets - The available target states of the service instance, paired with the transfer that produces each one.
 *
 * @returns {React.FC<Props>} A React component that allows the user to set a state on a service instance.
 */
export const SetStateSection: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  targets,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { notifyError } = useAppAlert();
  const isDisabled = !targets || targets.length === 0;
  const { authHelper, environmentHandler } = useContext(DependencyContext);
  const isHalted = environmentHandler.useIsHalted();
  const { mutate } = usePostStateTransfer(id, service_entity, {
    onError: (error) => {
      notifyError({
        title: error.message,
        testId: `${id}-error-message`,
      });
    },
  });
  const onSelect = (stateTarget: StateTarget) => {
    openModal(stateTarget);
  };

  /**
   * Opens a modal with a confirmation buttons.
   * @param {StateTarget} stateTarget - The target state and its transfer to be used in the operation.
   *
   *  @returns {void}
   */
  const openModal = (stateTarget: StateTarget): void => {
    const { target: targetState, transfer } = stateTarget;

    /**
     * Handles the submission of the form.
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
      title: words("inventory.statustab.confirmTitle"),
      actions: [
        <Button
          key="confirm"
          variant="primary"
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
        <Content component="p">
          {transfer.annotations?.web_confirm ??
            words("inventory.statustab.confirmMessage")(instance_identity, targetState)}
        </Content>
      ),
    });
  };

  return (
    <>
      {targets?.map((stateTarget, index) => (
        <StyledMenuItem
          key={`${stateTarget.target}-${index}`}
          isDisabled={isDisabled || isHalted}
          value={stateTarget.target}
          itemId={stateTarget.target}
          onClick={() => onSelect(stateTarget)}
          data-testid={`${id}-${stateTarget.target}`}
          isDanger={stateTarget.buttonVariant === "danger"}
          $buttonVariant={stateTarget.buttonVariant}
          icon={
            stateTarget.buttonIcon && (
              <DynamicFAIcon
                icon={stateTarget.buttonIcon}
                color={iconColorFor(stateTarget.buttonVariant)}
              />
            )
          }
        >
          <ActionDisabledTooltip
            isDisabled={isDisabled || isHalted}
            testingId={words("inventory.statustab.setInstanceState")}
            tooltipContent={
              isHalted
                ? words("environment.halt.tooltip")
                : words("inventory.statustab.actionDisabled")
            }
          >
            {stateTarget.buttonLabel}
          </ActionDisabledTooltip>
        </StyledMenuItem>
      ))}
      {(!targets || targets.length < 1) && (
        <MenuItem key={"no value"} value={"no value"} itemId={"no value"} isDisabled>
          None available
        </MenuItem>
      )}
    </>
  );
};

/**
 * PatternFly's `isDanger` on MenuItem already colors the text for `danger`
 * (icon coloring is handled separately, see `iconColorFor`). `warning` has no
 * PatternFly modifier at all, so its text color is set here explicitly - unlike
 * the design mock, which only tints the icon for warning (issue #7093).
 */
const StyledMenuItem = styled(MenuItem)<{ $buttonVariant?: string }>`
  ${({ $buttonVariant }) =>
    $buttonVariant === "warning" &&
    css`
      --pf-v6-c-menu__item--Color: var(--pf-t--global--text--color--status--warning--default);
    `}
`;
