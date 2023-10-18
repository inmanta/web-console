import React from "react";
import { Button, MenuFooter, ToolbarGroup } from "@patternfly/react-core";
import { Diff } from "@/Core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { words } from "@/UI/words";
import { MultiTextSelect } from "../../MultiTextSelect";

interface Props {
  statuses: Diff.Status[];
  setStatuses(statuses: Diff.Status[]): void;
}

export const StatusFilter: React.FC<Props> = ({ statuses, setStatuses }) => {
  const onSelect = (selection) => {
    if (statuses.includes(selection)) {
      setStatuses(statuses.filter((item) => item !== selection));
    } else {
      setStatuses([...statuses, selection]);
    }
  };

  const [allLabel, allCallback] =
    statuses.length === Diff.statuses.length
      ? [words("hideAll"), () => setStatuses([])]
      : [words("showAll"), () => setStatuses(Diff.statuses)];

  return (
    <ToolbarGroup align={{ default: "alignLeft" }}>
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
        options={Diff.statuses.map((option: Diff.Status) => {
          return {
            value: option,
            children: option,
            icon: <StatusDescriptor status={option} />,
            isSelected: statuses.includes(option),
          };
        })}
      />
    </ToolbarGroup>
  );
};
