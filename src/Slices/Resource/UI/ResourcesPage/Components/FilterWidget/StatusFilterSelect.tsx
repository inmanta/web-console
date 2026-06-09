import { FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { Resource, toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { OptionalToggleGroup } from "@/UI/Components";
import { words } from "@/UI/words";
import { IncludeExcludeSelect } from "./IncludeExcludeSelect";
import { removeInvertedSelection } from "./utils";

function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

const LastHandlerRunValues = typedKeys(Resource.LAST_HANDLER_RUN);
const ComplianceValues = typedKeys(Resource.COMPLIANCE);
const BlockedValues = typedKeys(Resource.BLOCKED);

export interface StatusFilterSelectProps {
  selectedStatuses?: string[];
  onChange: (statuses: string[]) => void;
}

export const StatusFilterSelect: React.FC<StatusFilterSelectProps> = ({
  selectedStatuses,
  onChange,
}) => {
  const onStatusClick = (selection: string) => {
    const currentStatuses = selectedStatuses ?? [];
    const safeSelectedStates = removeInvertedSelection(selection, currentStatuses);
    const updatedSelection = uniq(toggleValueInList(selection, safeSelectedStates));
    onChange(updatedSelection);
  };

  return (
    <Stack hasGutter style={{ padding: "1rem 0" }}>
      <StackItem>
        <FormGroup label={words("resources.filters.status.blocked.label")}>
          <IncludeExcludeSelect
            label={words("resources.filters.status.blocked.label")}
            placeholder={words("resources.filters.status.blocked.placeholder")}
            selected={selectedStatuses ?? []}
            options={BlockedValues}
            onOptionClick={onStatusClick}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.status.compliance.label")}>
          <IncludeExcludeSelect
            label={words("resources.filters.status.compliance.label")}
            placeholder={words("resources.filters.status.compliance.placeholder")}
            selected={selectedStatuses ?? []}
            options={ComplianceValues}
            onOptionClick={onStatusClick}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.status.lastHandlerRun.label")}>
          <IncludeExcludeSelect
            label={words("resources.filters.status.lastHandlerRun.label")}
            placeholder={words("resources.filters.status.lastHandlerRun.placeholder")}
            selected={selectedStatuses ?? []}
            options={LastHandlerRunValues}
            onOptionClick={onStatusClick}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.status.orphaned.label")}>
          <OptionalToggleGroup
            selected={selectedStatuses ?? []}
            onChange={onChange}
            options={[
              {
                label: words("include"),
                value: "orphaned",
                buttonId: "orphaned-include",
              },
              {
                label: words("exclude"),
                value: "!orphaned",
                buttonId: "orphaned-exclude",
              },
            ]}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup label={words("resources.filters.status.isDeploying")}>
          <OptionalToggleGroup
            selected={selectedStatuses ?? []}
            onChange={onChange}
            options={[
              {
                label: words("include"),
                value: "isDeploying",
                buttonId: "isDeploying-include",
              },
              {
                label: words("exclude"),
                value: "!isDeploying",
                buttonId: "isDeploying-exclude",
              },
            ]}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};
