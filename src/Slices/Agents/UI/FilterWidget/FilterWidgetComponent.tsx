import React from "react";
import { Divider, Form, FormGroup, Stack, StackItem } from "@patternfly/react-core";
import { toggleValueInList } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import { Filter } from "@/Slices/Agents/Core/Types";
import {
  ActiveFilterGroup,
  ActiveFilters,
  AddableTextInput,
  FilterDrawerPanelContent,
  MultiTextSelect,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { AgentStatus } from "@S/Agents/Core/Domain";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
  onClose: () => void;
}

/**
 * The FilterWidgetComponent component.
 *
 * Renders the contents of the Agents filter side panel. Both the name and the
 * status filters are shown at once inside a DrawerPanelContent, together with a
 * section that lists the currently active filters as removable chips.
 *
 * @Props {Props} - Component props.
 *  @prop {Filter} filter - Current filter state supplied by the parent.
 *  @prop {(filter: Filter) => void} setFilter - Setter to persist filter changes upstream.
 *  @prop {() => void} onClose - Callback executed when the filter drawer should be closed.
 *
 * @returns {React.ReactElement} The rendered filter widget.
 */
export const FilterWidgetComponent: React.FC<Props> = ({ filter, setFilter, onClose }) => {
  const agentStatuses = Object.values(AgentStatus);

  // --- Name ---
  const addName = (value: string) =>
    setFilter({ ...filter, name: uniq([...(filter.name ?? []), value]) });

  const removeNameChip = (value: string) => {
    const updated = (filter.name ?? []).filter((name) => name !== value);

    setFilter({ ...filter, name: updated.length > 0 ? updated : undefined });
  };

  const clearNameFilters = () => setFilter({ ...filter, name: undefined });

  // --- Status ---
  const handleStatusSelect = (selection: string | ((prev: string[]) => string[])) => {
    if (typeof selection !== "string") {
      return;
    }

    const updated = uniq(toggleValueInList(selection, filter.status ?? [])) as AgentStatus[];

    setFilter({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const removeStatusChip = (value: string) => {
    const updated = (filter.status ?? []).filter((status) => status !== value);

    setFilter({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const clearStatusFilters = () => setFilter({ ...filter, status: undefined });

  const clearAllFilters = () => setFilter({});

  const hasActiveFilters = (filter.name?.length ?? 0) > 0 || (filter.status?.length ?? 0) > 0;

  return (
    <FilterDrawerPanelContent title={words("agents.filters")} onClose={onClose}>
      <Stack hasGutter>
        <Form onSubmit={(e) => e.preventDefault()}>
          <StackItem>
            <FormGroup label={words("agents.columns.status")}>
              <MultiTextSelect
                toggleAriaLabel="Status"
                options={agentStatuses.map((status) => ({
                  value: status,
                  children: status,
                  isSelected: (filter.status ?? []).includes(status),
                }))}
                setSelected={handleStatusSelect}
                placeholderText={words("agents.filters.status.placeholder")}
                selected={filter.status ?? []}
              />
            </FormGroup>
          </StackItem>

          <StackItem>
            <AddableTextInput
              label={words("agents.columns.name")}
              placeholder={words("agents.filters.name.placeholder")}
              onAdd={addName}
              type="search"
            />
          </StackItem>
        </Form>

        <Divider />

        <ActiveFilters hasActiveFilters={hasActiveFilters} onClear={clearAllFilters}>
          {(filter.name?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("agents.columns.name")}
                values={filter.name}
                onRemove={removeNameChip}
                onRemoveGroup={clearNameFilters}
              />
            </StackItem>
          )}
          {(filter.status?.length ?? 0) > 0 && (
            <StackItem>
              <ActiveFilterGroup
                title={words("agents.columns.status")}
                values={filter.status}
                onRemove={removeStatusChip}
                onRemoveGroup={clearStatusFilters}
              />
            </StackItem>
          )}
        </ActiveFilters>
      </Stack>
    </FilterDrawerPanelContent>
  );
};
