import React, { useContext } from "react";
import {
  Divider,
  MenuToggle,
  Dropdown,
  MenuToggleElement,
  DropdownList,
  DropdownItem,
} from "@patternfly/react-core";
import { CopyIcon, EllipsisVIcon, FileMedicalAltIcon, ToolsIcon } from "@patternfly/react-icons";
import { ParsedNumber, words } from "@/Core";
import { Link } from "@/UI/Components/Link";
import { DependencyContext, useContributions } from "@/UI/Dependency";
import { DeleteAction } from "./DeleteAction";

interface InstanceActionsProps {
  instanceId: string;
  service_identity_attribute_value: string | undefined;
  entity: string;
  editDisabled: boolean;
  deleteDisabled: boolean;
  diagnoseDisabled: boolean;
  version: ParsedNumber;
}

export const RowActions: React.FunctionComponent<InstanceActionsProps> = ({
  instanceId,
  service_identity_attribute_value,
  entity,
  editDisabled,
  deleteDisabled,
  diagnoseDisabled,
  version,
}) => {
  const { routeManager, orchestratorProvider } = useContext(DependencyContext);

  const [isOpen, setIsOpen] = React.useState(false);

  const actions = useContributions("inventory.row.actions").filter(
    ({ isVisible }) => isVisible === undefined || isVisible(orchestratorProvider)
  );
  const context = { service: entity, instance: instanceId, editDisabled };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      aria-label="row actions toggle"
      variant="plain"
      onClick={onToggleClick}
      isExpanded={isOpen}
      icon={<EllipsisVIcon />}
    />
  );

  return (
    <Dropdown
      id={`menu-${instanceId}`}
      data-testid={`menu-${instanceId}`}
      toggle={toggle}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={() => setIsOpen(false)}
      isOpen={isOpen}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        <Link
          variant="plain"
          pathname={routeManager.getUrl("Diagnose", {
            service: entity,
            instance: instanceId,
          })}
          isDisabled={diagnoseDisabled}
        >
          <DropdownItem
            itemId="diagnose"
            isDisabled={diagnoseDisabled}
            icon={<FileMedicalAltIcon />}
          >
            {words("inventory.statustab.diagnose")}
          </DropdownItem>
        </Link>
        {actions.map(({ id, getLabel, icon: Icon, getUrl, isDisabled }) => {
          const disabled = isDisabled?.(context) ?? false;

          return (
            <Link
              key={id}
              variant="plain"
              pathname={getUrl(routeManager, context)}
              isDisabled={disabled}
            >
              <DropdownItem itemId={id} isDisabled={disabled} icon={<Icon />}>
                {getLabel()}
              </DropdownItem>
            </Link>
          );
        })}
        <Link
          variant="plain"
          pathname={routeManager.getUrl("EditInstance", {
            service: entity,
            instance: instanceId,
          })}
          isDisabled={editDisabled}
        >
          <DropdownItem itemId="edit" isDisabled={editDisabled} icon={<ToolsIcon />}>
            {words("inventory.editInstance.button")}
          </DropdownItem>
        </Link>

        <Link
          variant="plain"
          pathname={routeManager.getUrl("DuplicateInstance", {
            service: entity,
            instance: instanceId,
          })}
        >
          <DropdownItem itemId="duplicate" icon={<CopyIcon />}>
            {words("inventory.duplicateInstance.button")}
          </DropdownItem>
        </Link>

        <Divider component="li" />
        <DeleteAction
          isDisabled={deleteDisabled}
          service_entity={entity}
          instance_identity={service_identity_attribute_value ?? instanceId}
          id={instanceId}
          version={version}
        />
      </DropdownList>
    </Dropdown>
  );
};
