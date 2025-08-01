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
import { CopyIcon, EyeIcon, ToolsIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import {
  getAvailableStateTargets,
  getExpertStateTargets,
  isTransferDisabled,
} from "@/Slices/ServiceInstanceDetails/Utils";
import { ToastAlertMessage } from "@/Slices/ServiceInventory/UI/Components/ToastAlertMessage";
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import { DeleteAction, DestroyAction, ExpertStateTransfer, StateAction } from "./Actions";

/**
 * The InstanceActions Component
 *
 * This is a dropdown component containing all the instance actions that can be performed
 * - Edit in form
 * - Edit in Composer
 * - Delete instance
 * - If target states are available, a setState section with the available states
 *
 * @note This component requires the InstanceDetailsContext to work
 *
 * @returns {React.FC} A React Component displaying the Actions dropdown
 */
export const InstanceActions: React.FC = () => {
  const { instance, serviceModelQuery } = useContext(InstanceDetailsContext);
  const { routeManager, environmentHandler, orchestratorProvider } = useContext(DependencyContext);

  const editDisabled =
    instance.deleted || isTransferDisabled(instance, "on_update", serviceModelQuery.data);
  const deleteDisabled =
    instance.deleted || isTransferDisabled(instance, "on_delete", serviceModelQuery.data);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isExpertDropdownOpen, setIsExpertDropdownOpen] = useState<boolean>(false);
  const [blockedInterface, setBlockedInterface] = useState<boolean>(false);

  const stateTargets: string[] = getAvailableStateTargets(instance.state, serviceModelQuery.data);
  const expertStateTargets: string[] = getExpertStateTargets(serviceModelQuery.data);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="primary"
      isExpanded={isDropdownOpen}
      ref={toggleRef}
      aria-label="Actions-Toggle"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      {words("instanceDetails.actions")}
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
      {errorMessage && (
        <ToastAlertMessage
          stateErrorMessage={errorMessage}
          id="error-toast-actions"
          setStateErrorMessage={setErrorMessage}
        />
      )}
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
              onClose={() => setIsDropdownOpen(false)}
              setInterfaceBlocked={setBlockedInterface}
              setErrorMessage={setErrorMessage}
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
                  onClose={() => setIsDropdownOpen(false)}
                  setInterfaceBlocked={setBlockedInterface}
                  setErrorMessage={setErrorMessage}
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
          {orchestratorProvider.isComposerEnabled() ? (
            <DropdownItem
              key="Edit-Composer"
              aria-label="Edit-Composer"
              icon={<ToolsIcon />}
              isDisabled={editDisabled}
            >
              <Link
                variant="plain"
                pathname={routeManager.getUrl("InstanceComposerEditor", {
                  service: instance.service_entity,
                  instance: instance.id,
                })}
              >
                {words("instanceComposer.editButton")}
              </Link>
            </DropdownItem>
          ) : (
            <DropdownItem
              key="Show-Composer"
              aria-label="Show-Composer"
              icon={<EyeIcon />}
              isDisabled={editDisabled}
            >
              <Link
                variant="plain"
                pathname={routeManager.getUrl("InstanceComposerViewer", {
                  service: instance.service_entity,
                  instance: instance.id,
                })}
              >
                {words("instanceComposer.showButton")}
              </Link>
            </DropdownItem>
          )}
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
            onClose={() => setIsDropdownOpen(false)}
            setInterfaceBlocked={setBlockedInterface}
            setErrorMessage={setErrorMessage}
          />
          {stateTargets.length > 0 && (
            <>
              <Divider component="li" />
              <DropdownGroup>
                <StateAction
                  targets={stateTargets.sort()}
                  instance_display_identity={
                    instance.service_identity_attribute_value ?? instance.id
                  }
                  instance_id={instance.id}
                  service_entity={instance.service_entity}
                  version={instance.version}
                  onClose={() => setIsDropdownOpen(false)}
                  setInterfaceBlocked={setBlockedInterface}
                  setErrorMessage={setErrorMessage}
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
