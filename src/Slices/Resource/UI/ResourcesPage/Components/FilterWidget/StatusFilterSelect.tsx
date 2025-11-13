import React, { useState } from "react";
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, Tbody } from "@patternfly/react-table";
import { uniq } from "lodash-es";
import { toggleValueInList, Resource } from "@/Core";
import { words } from "@/UI/words";
import { IncludeExcludeOption } from "./IncludeExcludeOption";
import { removeInvertedSelection, invertFilter } from "./utils";

/**
 * @interface StatusFilterSelectProps
 * @desc Props for StatusFilterSelect.
 * @property {string[]} [selectedStatuses] - Currently selected status values (including negated ones).
 * @property {(statuses: string[]) => void} onChange - Callback invoked with the updated list of statuses.
 */
export interface StatusFilterSelectProps {
  selectedStatuses?: string[];
  onChange: (statuses: string[]) => void;
}

/**
 * @component StatusFilterSelect
 * @desc Presents resource status values in an include/exclude selector backed by a PatternFly Select.
 * @param {StatusFilterSelectProps} props - Component props.
 * @returns {React.ReactElement} The rendered status filter selector.
 */
export const StatusFilterSelect: React.FC<StatusFilterSelectProps> = ({
  selectedStatuses,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onStatusClick = (selection: string) => {
    const currentStatuses = selectedStatuses ?? [];
    const safeSelectedStates = removeInvertedSelection(selection, currentStatuses);
    const updatedSelection = uniq(toggleValueInList(selection, safeSelectedStates));
    setIsOpen(false);
    onChange(updatedSelection);
  };

  return (
    <Stack hasGutter style={{ padding: "1rem 0" }}>
      <StackItem>
        <Title headingLevel="h3" size="md">
          Deploy State
        </Title>
      </StackItem>
      <Select
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            aria-label="status-toggle"
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            icon={<SearchIcon />}
            isFullWidth
          >
            {words("resources.filters.status.placeholder")}
          </MenuToggle>
        )}
        aria-label={words("resources.column.deployState")}
        selected={selectedStatuses ?? []}
        isOpen={isOpen}
        onOpenChange={(openState: boolean) => setIsOpen(openState)}
      >
        {isOpen ? (
          <Table variant="compact">
            <Tbody>
              {Object.keys(Resource.Status).map((key) => {
                const state = Resource.Status[key];
                return (
                  <IncludeExcludeOption
                    key={state}
                    state={state}
                    includeActive={selectedStatuses ? selectedStatuses.includes(state) : false}
                    excludeActive={
                      selectedStatuses ? selectedStatuses.includes(invertFilter(state)) : false
                    }
                    onInclude={() => onStatusClick(state)}
                    onExclude={() => onStatusClick(invertFilter(state))}
                  />
                );
              })}
            </Tbody>
          </Table>
        ) : null}
      </Select>
    </Stack>
  );
};
