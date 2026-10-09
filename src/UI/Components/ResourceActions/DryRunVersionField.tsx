import React, { useState } from "react";
import {
  Content,
  Flex,
  FlexItem,
  FormGroup,
  FormGroupLabelHelp,
  Popover,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { DryRunVersion, DryRunVersionType, useGetDesiredStateVersions } from "@/Data/Queries";
import { words } from "@/UI/words";
import { InstanceVersionSelect } from "./InstanceVersionSelect";
import { ModelVersionSelect } from "./ModelVersionSelect";
import { ResourceActionInstance } from "./types";

/**
 * The id of the version select, which the form label points at.
 */
const FIELD_ID = "dry-run-version";

interface Props {
  instance: ResourceActionInstance | undefined;
  onSelect: (dryRunVersion: DryRunVersion | undefined) => void;
  blockedMessage: string | undefined;
}

/**
 * The version field of the dry-run dialog. With an instance it offers two version types to dry-run
 * against: the instance's own versions (the default) or the model versions, each in its own
 * select. Without an instance it offers only the model versions.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionInstance | undefined} instance - The instance whose versions to offer, if any
 *  @prop {(dryRunVersion: DryRunVersion | undefined) => void} onSelect - Called with the selected version, or undefined when the version type changes
 *  @prop {string | undefined} blockedMessage - When set, selecting a version is blocked: the select stays on the default version and shows this as the reason
 *
 * @returns {React.FC<Props>} The version form group
 */
export const DryRunVersionField: React.FC<Props> = ({ instance, onSelect, blockedMessage }) => {
  const [versionType, setVersionType] = useState<DryRunVersionType>(
    instance ? "instanceVersion" : "modelVersion"
  );
  const showsInstanceVersions = instance !== undefined && versionType === "instanceVersion";

  // Loads the model versions while the instance versions are shown, so switching doesn't wait.
  useGetDesiredStateVersions();

  // Switching starts over from the new type's default, since the select remounts.
  const switchVersionType = (next: DryRunVersionType) => {
    setVersionType(next);
    onSelect(undefined);
  };

  const selectVersion = (version: number) => onSelect({ type: versionType, version });

  return (
    <FormGroup
      label={words("resources.resourceActions.confirm.version.title")}
      fieldId={FIELD_ID}
      labelHelp={
        <Popover
          bodyContent={
            <Content component="p">
              {words("resources.resourceActions.confirm.version.searchHint")}
            </Content>
          }
          position="right"
        >
          <FormGroupLabelHelp
            aria-label={words("resources.resourceActions.confirm.version.moreInfo")}
          />
        </Popover>
      }
    >
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        {instance && (
          <ToggleGroup aria-label={words("resources.resourceActions.confirm.version.type.title")}>
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.type.instanceVersion")}
              isSelected={versionType === "instanceVersion"}
              isDisabled={Boolean(blockedMessage)}
              onChange={() => switchVersionType("instanceVersion")}
            />
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.type.modelVersion")}
              isSelected={versionType === "modelVersion"}
              isDisabled={Boolean(blockedMessage)}
              onChange={() => switchVersionType("modelVersion")}
            />
          </ToggleGroup>
        )}
        {/* One item for the select and its notice, so the gap above doesn't push the notice away
            from the select. */}
        <FlexItem>
          {showsInstanceVersions ? (
            <InstanceVersionSelect
              id={FIELD_ID}
              instance={instance}
              onSelect={selectVersion}
              blockedMessage={blockedMessage}
            />
          ) : (
            <ModelVersionSelect
              id={FIELD_ID}
              onSelect={selectVersion}
              blockedMessage={blockedMessage}
            />
          )}
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
