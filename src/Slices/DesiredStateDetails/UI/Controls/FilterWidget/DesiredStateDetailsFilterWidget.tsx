import React, { memo } from "react";
import { Divider, Form, Stack, StackItem, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useUrlStateWithFilter } from "@/Data";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface DesiredStateDetailsFilterWidgetProps {
  onClose: () => void;
}

type TextFilterKey = "type" | "agent" | "value";

const FIELDS: { key: TextFilterKey; label: string; placeholder: string }[] = [
  {
    key: "type",
    label: words("resources.filters.resource.type.label"),
    placeholder: words("resources.filters.resource.type.placeholder"),
  },
  {
    key: "agent",
    label: words("resources.filters.resource.agent.label"),
    placeholder: words("resources.filters.resource.agent.placeholder"),
  },
  {
    key: "value",
    label: words("resources.filters.resource.value.label"),
    placeholder: words("resources.filters.resource.value.placeholder"),
  },
];

/**
 * The DesiredStateDetailsFilterWidget component.
 *
 * A memoized side-panel drawer owning the desired state details filter state via URL
 * state management. Renders a free-text filter per resource identifier (type, agent,
 * value) followed by an active filters chip section. By managing the filter state
 * internally, this component avoids re-rendering when the parent page re-renders due
 * to other state changes.
 *
 * @Props {DesiredStateDetailsFilterWidgetProps} - Component props.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const DesiredStateDetailsFilterWidget: React.FC<DesiredStateDetailsFilterWidgetProps> = memo(
  ({ onClose }) => {
    const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>({
      route: "DesiredStateDetails",
    });

    const { addString, removeStringChip, clearStringGroup } = getFilterActions(filter, setFilter);

    const hasActiveFilters = FIELDS.some(({ key }) => (filter[key]?.length ?? 0) > 0);

    return (
      <FilterDrawerPanelContent title={words("resources.filters")} onClose={onClose}>
        <Stack hasGutter>
          <Form onSubmit={(e) => e.preventDefault()}>
            <StackItem>
              <Title headingLevel="h3" size="md">
                {words("resources.filters.resource.sectionTitle")}
              </Title>
            </StackItem>
            {FIELDS.map(({ key, label, placeholder }) => (
              <StackItem key={key}>
                <AddableTextInput
                  label={label}
                  placeholder={placeholder}
                  onAdd={(value) => addString(key, value)}
                />
              </StackItem>
            ))}
          </Form>

          <Divider />

          <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={() => setFilter({})}>
            {FIELDS.map(({ key, label }) =>
              (filter[key]?.length ?? 0) > 0 ? (
                <StackItem key={key}>
                  <ActiveFilterGroup
                    title={label}
                    values={filter[key]}
                    onRemove={(value) => removeStringChip(key, value)}
                    onRemoveGroup={() => clearStringGroup(key)}
                  />
                </StackItem>
              ) : null
            )}
          </ActiveFilters>
        </Stack>
      </FilterDrawerPanelContent>
    );
  }
);

DesiredStateDetailsFilterWidget.displayName = "DesiredStateDetailsFilterWidget";
