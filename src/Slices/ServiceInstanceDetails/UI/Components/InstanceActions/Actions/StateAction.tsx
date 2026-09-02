import React, { useContext, useState } from "react";
import { DropdownGroup, DropdownItem } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";
import styled, { css } from "styled-components";
import { ParsedNumber } from "@/Core";
import { StateTarget } from "@/Slices/ServiceInstanceDetails/Utils";
import { words } from "@/UI";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { iconColorFor } from "@/UI/Utils";
import { StateTransferModalContent } from "./StateTransferModalContent";

interface Props {
  targets: StateTarget[];

  /** Targets whose transfer carries `web_advanced_state`. Rendered behind a
   * collapsed "Advanced" disclosure instead of the primary "Set state" group
   * (issue #7095). */
  advancedTargets?: StateTarget[];
  instance_display_identity: string;
  instance_id: string;
  service_entity: string;
  version: ParsedNumber;
  collapseToggle: () => void;
  setInterfaceBlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * The StateTransfer Component
 *
 * @props {Props} props - The props of the components
 *  @prop {StateTarget[]} targets - a list of available target states, paired with the transfer that produces each one
 *  @prop {StateTarget[]} [advancedTargets] - targets demoted into the "Advanced" disclosure
 *  @prop {string} instance_display_identity - the display value of the instance Id
 *  @prop {string} instance_id - the hashed id of the instance
 *  @prop {string} service_entity - the service entity type of the instance
 *  @prop {ParsedNumber} version - the current version of the instance
 *  @prop {function} collapseToggle - collapses the dropdown toggle when the modal opens
 *  @prop {React.Dispatch<React.SetStateAction<boolean>>} setInterfaceBlocked - setState variable to block the interface when the modal is opened.
 *  This is meant to avoid clickEvents triggering the onOpenChange from the dropdown to shut down the modal.
 * @returns {React.FC<Props>} A React Component displaying the State transfer Dropdown Item
 */
export const StateAction: React.FC<Props> = ({
  service_entity,
  instance_display_identity,
  instance_id,
  targets = [],
  advancedTargets = [],
  version,
  collapseToggle,
  setInterfaceBlocked,
}) => {
  const { triggerModal } = useContext(ModalContext);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  /**
   * When a state is selected, block the interface, open the modal,
   * and set the selected state
   *
   * @param {StateTarget} stateTarget - the selected target state and its transfer
   */
  const onSelect = (stateTarget: StateTarget) => {
    triggerModal({
      title: words("instanceDetails.stateTransfer.confirmTitle"),
      content: (
        <StateTransferModalContent
          instance_id={instance_id}
          service_entity={service_entity}
          targetState={stateTarget.target}
          webConfirm={stateTarget.transfer.annotations?.web_confirm}
          instance_display_identity={instance_display_identity}
          version={version}
          setInterfaceBlocked={setInterfaceBlocked}
        />
      ),
      iconVariant: "danger",
      cancelCb: () => {
        setInterfaceBlocked(false);
      },
    });
    setInterfaceBlocked(true);
    // Collapse the toggle now: setInterfaceBlocked(true) suppresses the dropdown's
    // onOpenChange, so it can't collapse the toggle itself while the modal is open.
    collapseToggle();
  };

  /**
   * Renders a single target state as a dropdown item, shared between the
   * primary "Set state" group and the "Advanced" disclosure.
   *
   * @param {StateTarget} stateTarget - the target state and its transfer
   * @param {number} index - its position, to disambiguate targets sharing the same target state
   */
  const renderTarget = (stateTarget: StateTarget, index: number) => (
    <StyledDropdownItem
      onClick={() => onSelect(stateTarget)}
      key={`${stateTarget.target}-${index}`}
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
      {stateTarget.buttonLabel}
    </StyledDropdownItem>
  );

  return (
    <>
      {targets.length > 0 && (
        <DropdownGroup label={words("instanceDetails.setState.label")}>
          {targets.map(renderTarget)}
        </DropdownGroup>
      )}
      {advancedTargets.length > 0 && (
        <>
          <DropdownItem
            key="advanced-state-toggle"
            onClick={() => setIsAdvancedOpen((open) => !open)}
            icon={isAdvancedOpen ? <AngleDownIcon /> : <AngleRightIcon />}
          >
            {words("instanceDetails.setState.advanced")}
          </DropdownItem>
          {isAdvancedOpen && <DropdownGroup>{advancedTargets.map(renderTarget)}</DropdownGroup>}
        </>
      )}
    </>
  );
};

/**
 * PatternFly's `isDanger` on DropdownItem already colors the text for `danger`
 * (icon coloring is handled separately, see `iconColorFor`). `warning` has no
 * PatternFly modifier at all, so its text color is set here explicitly - unlike
 * the design mock, which only tints the icon for warning (issue #7093).
 */
const StyledDropdownItem = styled(DropdownItem)<{ $buttonVariant?: string }>`
  ${({ $buttonVariant }) =>
    $buttonVariant === "warning" &&
    css`
      --pf-v6-c-menu__item--Color: var(--pf-t--global--text--color--status--warning--default);
    `}
`;
