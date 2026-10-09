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
import { VersionPin, useGetDesiredStateVersions } from "@/Data/Queries";
import { words } from "@/UI/words";
import { InstanceVersionSelect } from "./InstanceVersionSelect";
import { ModelVersionSelect } from "./ModelVersionSelect";
import { ResourceActionInstance } from "./types";

type VersionType = VersionPin["field"];

/**
 * The id of the version select, which the form label points at.
 */
const FIELD_ID = "dry-run-version";

interface Props {
  instance: ResourceActionInstance | undefined;
  onSelect: (pin: VersionPin | undefined) => void;
  lockReason: string | undefined;
}

/**
 * The version field of the dry-run dialog. With an instance it offers two version types for the
 * same intent, the instance's own versions (the default) or the model versions, each in its own
 * select; otherwise only the model versions.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionInstance | undefined} instance - The instance whose versions to offer, if any
 *  @prop {(pin: VersionPin | undefined) => void} onSelect - Called with the picked version, or undefined when the version type changes
 *  @prop {string | undefined} lockReason - When set, keeps the select on the default version and shows this as the reason
 *
 * @returns {React.FC<Props>} The version form group
 */
export const DryRunVersionField: React.FC<Props> = ({ instance, onSelect, lockReason }) => {
  const [versionType, setVersionType] = useState<VersionType>(
    instance ? "instanceVersion" : "modelVersion"
  );
  const isInstanceType = instance !== undefined && versionType === "instanceVersion";

  // Loads the model versions while the instance versions are shown, so switching doesn't wait.
  useGetDesiredStateVersions();

  // Switching starts over from the new type's default, since the select remounts.
  const switchVersionType = (next: VersionType) => {
    setVersionType(next);
    onSelect(undefined);
  };

  const pick = (version: number) => onSelect({ field: versionType, version });

  const help = isInstanceType
    ? words("resources.resourceActions.confirm.version.instance.helper")
    : words("resources.resourceActions.confirm.version.helper");

  return (
    <FormGroup
      label={words("resources.resourceActions.confirm.version.title")}
      fieldId={FIELD_ID}
      labelHelp={
        <Popover
          bodyContent={
            <Content component="p">
              {help} {words("resources.resourceActions.confirm.version.searchHint")}
            </Content>
          }
          position="right"
        >
          <FormGroupLabelHelp
            aria-label={words("resources.resourceActions.confirm.version.help")}
          />
        </Popover>
      }
    >
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        {instance && (
          <ToggleGroup aria-label={words("resources.resourceActions.confirm.version.title")}>
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.type.instance")}
              isSelected={versionType === "instanceVersion"}
              isDisabled={Boolean(lockReason)}
              onChange={() => switchVersionType("instanceVersion")}
            />
            <ToggleGroupItem
              text={words("resources.resourceActions.confirm.version.type.model")}
              isSelected={versionType === "modelVersion"}
              isDisabled={Boolean(lockReason)}
              onChange={() => switchVersionType("modelVersion")}
            />
          </ToggleGroup>
        )}
        {/* One item for the select and its notice, so the gap above doesn't push the notice away
            from the select. */}
        <FlexItem>
          {isInstanceType ? (
            <InstanceVersionSelect
              id={FIELD_ID}
              instance={instance}
              onPick={pick}
              lockReason={lockReason}
            />
          ) : (
            <ModelVersionSelect id={FIELD_ID} onPick={pick} lockReason={lockReason} />
          )}
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
