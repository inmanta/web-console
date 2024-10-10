import React, { useContext, useState } from "react";
import { Button, MenuItem, Text } from "@patternfly/react-core";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ToastAlertMessage } from "../../ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  targets: string[] | null;
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
 * @prop {string[]} targets - The available states of the service instance.
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
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");

  const onSelect = (value: string) => {
    setTargetState(value);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(instance_identity, value),
    );
    openModal();
  };

  const isDisabled = !targets || targets.length === 0;
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"TriggerSetState">({
    kind: "TriggerSetState",
    service_entity,
    id,
    version,
  });
  const isHalted = environmentModifier.useIsHalted();

  /**
   * Handles the submission of the form.
   *
   * @param {string} targetState - The target state to be used in the operation.
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (targetState: string) => {
    const result = await trigger(targetState);

    if (Maybe.isSome(result)) {
      setStateErrorMessage(result.value);
    }
    closeModal();
  };

  /**
   * Opens a modal with a confirmation buttons.
   *
   *  @returns {void}
   */
  const openModal = (): void => {
    triggerModal({
      title: words("inventory.statustab.confirmTitle"),
      actions: [
        <Button
          key="confirm"
          variant="primary"
          data-testid={`${id}-state-modal-confirm`}
          onClick={() => onSubmit(targetState)}
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
      content: <Text> {confirmationText}</Text>,
    });
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
      {targets?.map((target) => (
        <MenuItem
          key={target}
          isDisabled={isDisabled || isHalted}
          value={target}
          itemId={target}
          onClick={() => onSelect(target)}
          data-testid={`${id}-${target}`}
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
            {target}
          </ActionDisabledTooltip>
        </MenuItem>
      ))}
      {(!targets || targets.length < 1) && (
        <MenuItem
          key={"no value"}
          value={"no value"}
          itemId={"no value"}
          isDisabled
        >
          None available
        </MenuItem>
      )}
    </>
  );
};
