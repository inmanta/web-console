import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Text,
} from "@patternfly/react-core";
import { CaretDownIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import ConfirmationModal from "./ConfirmationModal";
import { ToastAlertMessage } from "./ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
  possibleInstanceStates: string[];
}

export const ForceStateAction: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  possibleInstanceStates,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const dropdownItems = possibleInstanceStates.map((target) => (
    <DropdownItem
      key={target}
      value={target}
      data-testid={`${id}-${target}-expert`}
    >
      {target}
    </DropdownItem>
  ));
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"TriggerForceState">({
    kind: "TriggerForceState",
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
      words("inventory.statustab.forceState.message")(
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
        ariaLabel={words("inventory.statustab.forceState")}
        tooltipContent={
          isHalted
            ? words("environment.halt.tooltip")
            : words("inventory.statustab.actionDisabled")
        }
      >
        <StyledDropdown
          toggle={
            <DropdownToggle
              data-testid={`${id}-force-state-toggle`}
              onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
              toggleIndicator={CaretDownIcon}
            >
              {words("inventory.statustab.forceState")}
            </DropdownToggle>
          }
          dropdownItems={dropdownItems}
          isOpen={isDropdownOpen}
          onSelect={onSelect}
        />
      </ActionDisabledTooltip>
      <ConfirmationModal
        title={words("inventory.statustab.forceState.confirmTitle")}
        onSetInstanceState={onSubmit}
        id={id}
        targetState={targetState}
        isModalOpen={isModalOpen}
        setIsModalOpen={handleModalToggle}
        setErrorMessage={setStateErrorMessage}
      >
        <Text>{confirmationText}</Text>
        <br />
        <Text>{words("inventory.statustab.forceState.confirmMessage")}</Text>
        <Text>{words("inventory.statustab.forceState.confirmQuestion")}</Text>
      </ConfirmationModal>
    </>
  );
};

const StyledDropdown = styled(Dropdown)`
  --pf-c-dropdown__toggle--before--BorderTopColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--before--BorderRightColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--before--BorderLeftColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--before--BorderBottomColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown--m-expanded__toggle--before--BorderBottomColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--hover--before--BorderBottomColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--focus--before--BorderBottomColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--active--before--BorderBottomColor: var(
    --pf-global--danger-color--100
  );
  --pf-c-dropdown__toggle--Color: var(--pf-global--danger-color--100);
  --pf-c-dropdown__toggle--Color: var(--pf-global--danger-color--100);
`;
