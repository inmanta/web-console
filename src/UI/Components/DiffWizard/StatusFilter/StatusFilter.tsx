import React, { useState } from "react";
import {
  Button,
  Select,
  SelectOption,
  SelectVariant,
  ToolbarGroup,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Diff } from "@/Core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { words } from "@/UI/words";

interface Props {
  statuses: Diff.Status[];
  setStatuses(statuses: Diff.Status[]): void;
}

export const StatusFilter: React.FC<Props> = ({ statuses, setStatuses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = (isOpen) => setIsOpen(isOpen);
  const onSelect = (event, selection) => {
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
    <ToolbarGroup alignment={{ default: "alignLeft" }}>
      <Select
        variant={SelectVariant.checkbox}
        toggleAriaLabel="StatusFilter"
        aria-label="StatusFilterOptions"
        onToggle={onToggle}
        onSelect={onSelect}
        selections={statuses}
        isCheckboxSelectionBadgeHidden
        isOpen={isOpen}
        placeholderText="Filter by Status"
        footer={
          <Button variant="link" isInline onClick={allCallback}>
            {allLabel}
          </Button>
        }
      >
        {Diff.statuses.map((status) => (
          <SelectOption
            key={status}
            value={status}
            aria-label="StatusFilterOption"
          >
            <StyledStatusDescriptor status={status} /> {status}
          </SelectOption>
        ))}
      </Select>
    </ToolbarGroup>
  );
};

const StyledStatusDescriptor = styled(StatusDescriptor)`
  display: inline-block;
`;
