import React, { useContext, useState } from "react";
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { CopyIcon, ToolsIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { DependencyContext, useVisibleLinkActions } from "@inmanta/web-console-core/Dependency";
import { InstanceDetailsContext } from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Core/Context";
import {
  getAvailableStateTargets,
  getExpertStateTargets,
  getTransferForType,
  isTransferDisabled,
  StateTarget,
} from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Utils";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { DeleteAction, DestroyAction, ExpertStateTransfer, StateAction } from "./Actions";

/**
 * The InstanceActions Component
 *
 * This is a dropdown component containing all the instance actions that can be performed
 * - The links other features contribute to the `instance.actions` extension point, e.g. the
 *   composer
 * - Edit in form
 * - Delete instance
 * - If target states are available, a setState section with the available states
 *
 * @note This component requires the InstanceDetailsContext to work
 *
 * @returns {React.FC} A React Component displaying the Actions dropdown
 */
export const InstanceActions: React.FC = () => {
  const { instance, serviceModelQuery } = useContext(InstanceDetailsContext);
  const { routeManager, environmentHandler } = useContext(DependencyContext);

  const editDisabled =
    instance.deleted || isTransferDisabled(instance, "on_update", serviceModelQuery.data);
  const deleteTransfer = getTransferForType(instance, "on_delete", serviceModelQuery.data);
  const deleteDisabled = instance.deleted || deleteTransfer === undefined;

  const actions = useVisibleLinkActions("instance.actions");
  const context = { service: instance.service_entity, instance: instance.id, editDisabled };

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isExpertDropdownOpen, setIsExpertDropdownOpen] = useState<boolean>(false);
  const [blockedInterface, setBlockedInterface] = useState<boolean>(false);

  const stateTargets: StateTarget[] = getAvailableStateTargets(
    instance.state,
    serviceModelQuery.data
  );
  const primaryStateTargets = stateTargets.filter((target) => !target.advanced);
  const advancedStateTargets = stateTargets.filter((target) => target.advanced);
  const expertStateTargets: string[] = getExpertStateTargets(serviceModelQuery.data);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="primary"
      isExpanded={isDropdownOpen}
      ref={toggleRef}
      aria-label="Actions-Toggle"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      {words("actions")}
    </MenuToggle>
  );

  const expertToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <ExpertMenu
      variant="secondary"
      isExpanded={isExpertDropdownOpen}
      ref={toggleRef}
      aria-label="Expert-Actions-Toggle"
      onClick={() => setIsExpertDropdownOpen(!isExpertDropdownOpen)}
    >
      {words("instanceDetails.expertActions")}
    </ExpertMenu>
  );

  return (
    <RightAlignedButtons>
      {environmentHandler.useIsExpertModeEnabled() && (
        <Dropdown
          isOpen={isExpertDropdownOpen}
          onOpenChange={(isOpen: boolean) => !blockedInterface && setIsExpertDropdownOpen(isOpen)}
          toggle={expertToggle}
        >
          <DropdownList>
            <DestroyAction
              instance_display_identity={instance.service_identity_attribute_value ?? instance.id}
              instance_id={instance.id}
              service_entity={instance.service_entity}
              version={instance.version}
              collapseToggle={() => setIsExpertDropdownOpen(false)}
              setInterfaceBlocked={setBlockedInterface}
            />
            {!instance.deleted && expertStateTargets.length > 0 && (
              <>
                <Divider component="li" />
                <ExpertStateTransfer
                  targets={expertStateTargets}
                  instance_display_identity={
                    instance.service_identity_attribute_value ?? instance.id
                  }
                  instance_id={instance.id}
                  service_entity={instance.service_entity}
                  version={instance.version}
                  collapseToggle={() => setIsExpertDropdownOpen(false)}
                  setInterfaceBlocked={setBlockedInterface}
                />
              </>
            )}
          </DropdownList>
        </Dropdown>
      )}
      <Dropdown
        isOpen={isDropdownOpen}
        onOpenChange={(isOpen: boolean) => !blockedInterface && setIsDropdownOpen(isOpen)}
        toggle={toggle}
        popperProps={{ position: "right" }}
      >
        <DropdownList>
          {actions.map(({ id, getLabel, icon: Icon, getUrl, isDisabled }) => (
            <DropdownItem
              key={id}
              itemId={id}
              icon={<Icon />}
              isDisabled={isDisabled?.(context) ?? false}
            >
              <Link variant="plain" pathname={getUrl(routeManager, context)}>
                {getLabel()}
              </Link>
            </DropdownItem>
          ))}
          <DropdownItem key="Edit" isDisabled={editDisabled} icon={<ToolsIcon />}>
            <Link
              variant="plain"
              pathname={routeManager.getUrl("EditInstance", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={editDisabled}
            >
              {words("inventory.editInstance.button")}
            </Link>
          </DropdownItem>
          <DropdownItem key="Duplicate" icon={<CopyIcon />}>
            <Link
              variant="plain"
              pathname={routeManager.getUrl("DuplicateInstance", {
                service: instance.service_entity,
                instance: instance.id,
              })}
            >
              {words("inventory.duplicateInstance.button")}
            </Link>
          </DropdownItem>
          <DeleteAction
            isDisabled={deleteDisabled}
            service_entity={instance.service_entity}
            instance_display_identity={instance.service_identity_attribute_value ?? instance.id}
            instance_id={instance.id}
            version={instance.version}
            webConfirm={deleteTransfer?.annotations?.web_confirm}
            collapseToggle={() => setIsDropdownOpen(false)}
            setInterfaceBlocked={setBlockedInterface}
          />
          {stateTargets.length > 0 && (
            <>
              <Divider component="li" />
              <DropdownGroup>
                <StateAction
                  targets={primaryStateTargets}
                  advancedTargets={advancedStateTargets}
                  instance_display_identity={
                    instance.service_identity_attribute_value ?? instance.id
                  }
                  instance_id={instance.id}
                  service_entity={instance.service_entity}
                  version={instance.version}
                  collapseToggle={() => setIsDropdownOpen(false)}
                  setInterfaceBlocked={setBlockedInterface}
                />
              </DropdownGroup>
            </>
          )}
        </DropdownList>
      </Dropdown>
    </RightAlignedButtons>
  );
};

// styling to keep the action buttons neatly aligned to the right
const RightAlignedButtons = styled.span`
  float: right;
  margin-right: var(--pf-t--global--spacer--lg);
  display: flex;
  gap: var(--pf-t--global--spacer--lg);
`;

// There is no actual variant for a red dropdown. This is why we override the colors for the expert dropdown.
const ExpertMenu = styled(MenuToggle)`
  &.pf-v6-c-menu-toggle.pf-m-secondary {
    --pf-v6-c-menu-toggle--m-secondary--BorderColor: var(
      --pf-t--global--border--color--status--danger--default
    );
    --pf-v6-c-menu-toggle--m-secondary--Color: var(
      --pf-t--global--text--color--status--danger--default
    );
    --pf-v6-c-menu-toggle--m-secondary__toggle-icon--Color: var(
      --pf-t--global--icon--color--status--danger--default
    );
  }
  &.pf-v6-c-menu-toggle:is(.pf-m-expanded, [aria-expanded="true"]) {
    --pf-v6-c-menu-toggle--Color: var(--pf-t--global--text--color--status--danger--default);
    --pf-v6-c-menu-toggle--BorderColor: var(--pf-t--global--border--color--status--danger--clicked);
    --pf-v6-c-menu-toggle__toggle-icon--Color: var(
      --pf-t--global--icon--color--status--danger--clicked
    );
  }
  &.pf-v6-c-menu-toggle:is(:hover, :focus) {
    --pf-v6-c-menu-toggle--Color: var(--pf-t--global--text--color--status--danger--hover);
    --pf-v6-c-menu-toggle--BorderColor: var(--pf-t--global--border--color--status--danger--hover);
    --pf-v6-c-menu-toggle__toggle-icon--Color: var(
      --pf-t--global--icon--color--status--danger--hover
    );
  }
`;
