import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Text,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import ConfirmationModal from "./ConfirmationModal";
import { ToastAlertMessage } from "./ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  targets: string[] | null;
  instance_identity: string;
}

export const SetStateAction: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  targets,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const dropdownItems = targets?.map((target) => (
    <DropdownItem key={target} value={target} data-testid={`${id}-${target}`}>
      {target}
    </DropdownItem>
  ));
  const isDisabled = !dropdownItems || dropdownItems.length === 0;
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

  const onSelect = (event) => {
    setIsDropdownOpen(false);
    setTargetState(event.target.text);
    setConfirmationText(
      words("inventory.statustab.confirmMessage")(
        instance_identity,
        event.target.text,
      ),
    );
    handleModalToggle();
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
        <Dropdown
          toggle={
            <DropdownToggle
              data-testid={`${id}-set-state-toggle`}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              toggleIndicator={CaretDownIcon}
              isDisabled={isDisabled || isHalted}
            >
              {words("inventory.statustab.setInstanceState")}
            </DropdownToggle>
          }
          dropdownItems={dropdownItems}
          isOpen={isDropdownOpen}
          onSelect={onSelect}
        />
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
