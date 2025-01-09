import React, { useContext } from "react";
import {
  Divider,
  MenuToggle,
  Dropdown,
  MenuToggleElement,
  DropdownList,
  DropdownItem,
} from "@patternfly/react-core";
import {
  CopyIcon,
  EllipsisVIcon,
  EyeIcon,
  FileMedicalAltIcon,
  ToolsIcon,
} from "@patternfly/react-icons";
import { ParsedNumber } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import { DeleteAction } from "./DeleteAction";

export interface InstanceActionsProps {
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
  const { routeManager, featureManager } = useContext(DependencyContext);

  const [isOpen, setIsOpen] = React.useState(false);

  const composerEnabled = featureManager.isComposerEnabled();

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
        <DropdownItem
          itemId="diagnose"
          isDisabled={diagnoseDisabled}
          icon={<FileMedicalAltIcon />}
        >
          <Link
            variant="plain"
            pathname={routeManager.getUrl("Diagnose", {
              service: entity,
              instance: instanceId,
            })}
            isDisabled={diagnoseDisabled}
          >
            {words("inventory.statustab.diagnose")}
          </Link>
        </DropdownItem>
        {composerEnabled && (
          <DropdownItem
            itemId="edit-composer"
            isDisabled={editDisabled}
            icon={<ToolsIcon />}
          >
            <Link
              variant="plain"
              pathname={routeManager.getUrl("InstanceComposerEditor", {
                service: entity,
                instance: instanceId,
              })}
              isDisabled={editDisabled}
            >
              {words("instanceComposer.editButton")}
            </Link>
          </DropdownItem>
        )}
        {featureManager.isComposerEnabled() && (
          <DropdownItem itemId="show-composer" icon={<EyeIcon />}>
            <Link
              variant="plain"
              pathname={routeManager.getUrl("InstanceComposerViewer", {
                service: entity,
                instance: instanceId,
              })}
            >
              {words("instanceComposer.showButton")}
            </Link>
          </DropdownItem>
        )}
        <DropdownItem
          itemId="edit"
          isDisabled={editDisabled}
          icon={<ToolsIcon />}
        >
          <Link
            variant="plain"
            pathname={routeManager.getUrl("EditInstance", {
              service: entity,
              instance: instanceId,
            })}
            isDisabled={editDisabled}
          >
            {words("inventory.editInstance.button")}
          </Link>
        </DropdownItem>

        <DropdownItem itemId="duplicate" icon={<CopyIcon />}>
          <Link
            variant="plain"
            pathname={routeManager.getUrl("DuplicateInstance", {
              service: entity,
              instance: instanceId,
            })}
          >
            {words("inventory.duplicateInstance.button")}
          </Link>
        </DropdownItem>
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
