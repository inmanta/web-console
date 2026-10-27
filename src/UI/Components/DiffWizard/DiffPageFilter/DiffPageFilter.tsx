import React from "react";
import { Button, MenuFooter, TextInput, ToolbarGroup, ToolbarItem } from "@patternfly/react-core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { Diff, words } from "@inmanta/web-console-core";
import { MultiTextSelect } from "@inmanta/web-console-ui/Components/MultiTextSelect";

interface Props {
  statuses: Diff.Status[];
  setStatuses(statuses: Diff.Status[]): void;
  searchFilter: string;
  setSearchFilter(filter): void;
}

export const DiffPageFilter: React.FC<Props> = ({
  statuses,
  setStatuses,
  setSearchFilter,
  searchFilter,
}) => {
  const onSelect = (selection) => {
    if (statuses.includes(selection)) {
      setStatuses(statuses.filter((item) => item !== selection));
    } else {
      setStatuses([...statuses, selection]);
    }
  };

  const [allLabel, allCallback] =
    statuses.length === Diff.defaultStatuses.length
      ? [words("hideAll"), () => setStatuses([])]
      : [words("showAll"), () => setStatuses(Diff.defaultStatuses)];

  return (
    <ToolbarGroup align={{ default: "alignStart" }}>
      <ToolbarItem>
        <MultiTextSelect
          aria-label="StatusFilterOptions"
          toggleAriaLabel="StatusFilter"
          placeholderText="Filter by Status"
          selected={statuses}
          setSelected={onSelect}
          noInputField
          footer={
            <MenuFooter>
              <Button variant="link" isInline onClick={allCallback}>
                {allLabel}
              </Button>
            </MenuFooter>
          }
          options={Diff.defaultStatuses.map((option: Diff.Status) => {
            return {
              value: option,
              children: option,
              icon: <StatusDescriptor status={option} />,
              isSelected: statuses.includes(option),
            };
          })}
        />
      </ToolbarItem>
      <ToolbarItem>
        <TextInput
          value={searchFilter}
          type="search"
          onChange={(_event, value) => setSearchFilter(value)}
          aria-label="SearchFilter"
          placeholder="Filter by type"
        />
      </ToolbarItem>
    </ToolbarGroup>
  );
};
