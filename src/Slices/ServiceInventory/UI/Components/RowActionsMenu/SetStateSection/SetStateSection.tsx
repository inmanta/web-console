import React, { useContext, useState } from "react";
import { MenuItem, Text } from "@patternfly/react-core";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import ConfirmationModal from "../../ConfirmationModal";
import { ToastAlertMessage } from "../../ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  targets: string[] | null;
  instance_identity: string;
  onClose: () => void;
}

export const SetStateSection: React.FunctionComponent<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  targets,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onSelect = (value: string) => {
    setTargetState(value);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(instance_identity, value),
    );
    handleModalToggle();
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

  const onSubmit = async (targetState: string) => {
    const result = await trigger(targetState);
    if (Maybe.isSome(result)) {
      setStateErrorMessage(result.value);
    }
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
        isDisabled={isDisabled || isHalted}
        ariaLabel={words("inventory.statustab.setInstanceState")}
        tooltipContent={
          isHalted
            ? words("environment.halt.tooltip")
            : words("inventory.statustab.actionDisabled")
        }
      >
        {targets?.map((target) => (
          <MenuItem
            key={target}
            value={target}
            itemId={target}
            onClick={() => onSelect(target)}
            data-testid={`${id}-${target}`}
          >
            {target}
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
      </ActionDisabledTooltip>
      <ConfirmationModal
        title={words("inventory.statustab.confirmTitle")}
        onSetInstanceState={onSubmit}
        id={id}
        targetState={targetState}
        isModalOpen={isModalOpen}
        setIsModalOpen={handleModalToggle}
        setErrorMessage={setStateErrorMessage}
      >
        <Text> {confirmationText}</Text>
      </ConfirmationModal>
    </>
  );
};
