import React, { useContext } from "react";
import { DropdownGroup, DropdownItem } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { StateTransferModalContent } from "./StateTransferModalContent";

interface Props {
  targets: string[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  onClose: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * The StateTransfer Component
 *
 * @props {Props} props - The props of the components
 *  @prop {string[]} targets - a list of available states targets for the expert mode
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} onClose - callback method when the modal gets closed
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the State transfer Dropdown Item
 */
export const StateAction: React.FC<Props> = ({
  service_entity,
  instance_display_identity,
  instance_id,
  targets = [],
  version,
  onClose,
  setInterfaceBlocked,
  setErrorMessage,
}) => {
  const { triggerModal } = useContext(ModalContext);

  /**
   * When a state is selected, block the interface, open the modal,
   * and set the selected state
   *
   * @param {string} value - the selected state
   */
  const onSelect = (value: string) => {
    triggerModal({
      title: words("instanceDetails.stateTransfer.confirmTitle"),
      content: (
        <StateTransferModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          targetState={value}
          instance_display_identity={instance_display_identity}
          version={version}
          setErrorMessage={setErrorMessage}
          setInterfaceBlocked={setInterfaceBlocked}
        />
      ),
      iconVariant: "danger",
      cancelCb: () => {
        setInterfaceBlocked(false);
        onClose();
      },
    });
    setInterfaceBlocked(true);
  };

  return (
    <>
      <DropdownGroup label={words("instanceDetails.setState.label")}>
        {targets.map((target) => (
          <DropdownItem onClick={() => onSelect(target)} key={target}>
            {target}
          </DropdownItem>
        ))}
      </DropdownGroup>
    </>
  );
};
