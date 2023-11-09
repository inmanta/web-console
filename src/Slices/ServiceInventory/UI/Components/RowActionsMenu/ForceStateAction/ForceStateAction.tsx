import React, { useContext, useState } from "react";
import { Divider, DrilldownMenu, MenuItem, Text } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import ConfirmationModal from "../../ConfirmationModal";
import { ToastAlertMessage } from "../../ToastAlertMessage";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
  availableStates: string[];
  insetHeight: string;
}

export const ForceStateAction: React.FC<Props> = ({
  service_entity,
  id,
  instance_identity,
  version,
  availableStates,
  insetHeight,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };
  const menuItems = availableStates.map((target) => (
    <MenuItem
      key={target}
      value={target}
      data-testid={`${id}-${target}-expert`}
      onClick={() => onSelect(target)}
    >
      {target}
    </MenuItem>
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

  const onSelect = (value: string) => {
    setTargetState(value);
    setConfirmationText(
      words("inventory.statustab.forceState.message")(instance_identity, value),
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
        <MenuItem
          isDanger
          itemId="group:expertstate"
          data-testid="forceState"
          icon={<WarningTriangleIcon />}
          direction="down"
          style={{
            backgroundColor: "var(--pf-v5-global--palette--red-50)",
          }}
          drilldownMenu={
            <DrilldownMenu
              id="drilldownMenuExpertState"
              aria-label="drilldownMenuExpertState"
              style={{ insetBlockStart: insetHeight }}
            >
              <MenuItem
                style={{
                  backgroundColor: "var(--pf-v5-global--palette--red-50)",
                }}
                icon={<WarningTriangleIcon />}
                itemId="group:expertstate_breadcrumb"
                direction="up"
                aria-hidden
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
