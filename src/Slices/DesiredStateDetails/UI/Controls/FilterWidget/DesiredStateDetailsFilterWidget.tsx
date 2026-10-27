import React, { memo } from "react";
import { Divider, Form, Stack, StackItem, Title } from "@patternfly/react-core";
import { Resource, words } from "@inmanta/web-console-core";
import { useUrlStateWithFilter } from "@inmanta/web-console-core/Common";
import { AddableTextInput } from "@inmanta/web-console-ui/Components/AddableTextInput";
import {
  ActiveFilterGroup,
  ActiveFilters,
  FilterDrawerPanelContent,
  getFilterActions,
} from "@inmanta/web-console-ui/Components/FilterDrawer";

interface DesiredStateDetailsFilterWidgetProps {
  onClose: () => void;
}

type TextFilterKey = "type" | "agent" | "value";

const getFields = (): { key: TextFilterKey; label: string; placeholder: string }[] => [
  {
    key: "type",
    label: words("type"),
    placeholder: words("resources.filters.resource.type.placeholder"),
  },
  {
    key: "agent",
    label: words("resources.filters.resource.agent.label"),
    placeholder: words("resources.filters.resource.agent.placeholder"),
  },
  {
    key: "value",
    label: words("value"),
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

    const fields = getFields();
    const hasActiveFilters = fields.some(({ key }) => (filter[key]?.length ?? 0) > 0);

    return (
      <FilterDrawerPanelContent title={words("filters")} onClose={onClose}>
        <Stack hasGutter>
          <Form onSubmit={(e) => e.preventDefault()}>
            <StackItem>
              <Title headingLevel="h3" size="md">
                {words("resourceId")}
              </Title>
            </StackItem>
            {fields.map(({ key, label, placeholder }) => (
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
            {fields.map(({ key, label }) =>
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
