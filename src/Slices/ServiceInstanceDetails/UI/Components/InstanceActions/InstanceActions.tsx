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
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import {
  DeleteAction,
  DestroyAction,
  ExpertStateTransfer,
  StateAction,
} from "./Actions";

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
  const { routeManager, environmentModifier, featureManager } =
    useContext(DependencyContext);

  const editDisabled =
    instance.deleted ||
    isTransferDisabled(instance, "on_update", serviceModelQuery.data);
  const deleteDisabled =
    instance.deleted ||
    isTransferDisabled(instance, "on_delete", serviceModelQuery.data);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isExpertDropdownOpen, setIsExpertDropdownOpen] =
    useState<boolean>(false);
  const [blockedInterface, setBlockedInterface] = useState<boolean>(false);

  const stateTargets: string[] = getAvailableStateTargets(
    instance.state,
    serviceModelQuery.data,
  );
  const expertStateTargets: string[] = getExpertStateTargets(
    serviceModelQuery.data,
  );

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
      {environmentModifier.useIsExpertModeEnabled() && (
        <Dropdown
          isOpen={isExpertDropdownOpen}
          onOpenChange={(isOpen: boolean) =>
            !blockedInterface && setIsExpertDropdownOpen(isOpen)
          }
          toggle={expertToggle}
        >
          <DropdownList>
            <DestroyAction
              instance_display_identity={
                instance.service_identity_attribute_value ?? instance.id
              }
              instance_id={instance.id}
              service_entity={instance.service_entity}
              version={instance.version}
              onClose={() => setIsDropdownOpen(false)}
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
                  onClose={() => setIsDropdownOpen(false)}
                  setInterfaceBlocked={setBlockedInterface}
                />
              </>
            )}
          </DropdownList>
        </Dropdown>
      )}

      <Dropdown
        isOpen={isDropdownOpen}
        onOpenChange={(isOpen: boolean) =>
          !blockedInterface && setIsDropdownOpen(isOpen)
        }
        toggle={toggle}
        popperProps={{ position: "right" }}
      >
        <DropdownList>
          {featureManager.isComposerEnabled() ? (
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
                {words("inventory.instanceComposer.editButton")}
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
                {words("inventory.instanceComposer.showButton")}
              </Link>
            </DropdownItem>
          )}
          <DropdownItem
            key="Edit"
            isDisabled={editDisabled}
            icon={<ToolsIcon />}
          >
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
            instance_display_identity={
              instance.service_identity_attribute_value ?? instance.id
            }
            instance_id={instance.id}
            version={instance.version}
            onClose={() => setIsDropdownOpen(false)}
            setInterfaceBlocked={setBlockedInterface}
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
                />
              </DropdownGroup>
            </>
          )}
        </DropdownList>
      </Dropdown>
    </RightAlignedButtons>
  );
};

const RightAlignedButtons = styled.span`
  float: right;
  margin-right: var(--pf-v5-global--spacer--lg);
  display: flex;
  gap: var(--pf-v5-global--spacer--lg);
`;

// There is no actual variant for a red dropdown. This is why we override the colors for the expert dropdown.
const ExpertMenu = styled(MenuToggle)`
  &.pf-v5-c-menu-toggle {
    --pf-v5-c-menu-toggle--m-secondary--before--BorderColor: var(
      --pf-v5-global--danger-color--100
    );
    --pf-v5-c-menu-toggle--m-secondary--Color: var(
      --pf-v5-global--danger-color--100
    );
    --pf-v5-c-menu-toggle--m-secondary--hover--before--BorderColor: var(
      --pf-v5-global--danger-color--200
    );
    --pf-v5-c-menu-toggle--m-secondary--focus--before--BorderColor: var(
      --pf-v5-global--danger-color--200
    );
    --pf-v5-c-menu-toggle--m-secondary--active--before--BorderColor: var(
      --pf-v5-global--danger-color--200
    );
    --pf-v5-c-menu-toggle--m-secondary--m-expanded--Color: var(
      --pf-v5-global--danger-color--100
    );
    --pf-v5-c-menu-toggle--m-expanded__toggle--m-secondary--before--BorderColor: var(
      --pf-v5-global--danger-color--100
    );
  }
`;
