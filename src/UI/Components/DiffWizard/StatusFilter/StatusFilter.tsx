import React, { useState } from "react";
import {
  Button,
  Select,
  SelectOption,
  SelectVariant,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Diff } from "@/Core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";

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
      ? ["Hide All", () => setStatuses([])]
      : ["Show All", () => setStatuses(Diff.statuses)];

  return (
    <Select
      variant={SelectVariant.checkbox}
      aria-label="Select Input"
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
        <SelectOption key={status} value={status}>
          <StyledStatusDescriptor status={status} /> {status}
        </SelectOption>
      ))}
    </Select>
  );
};

const StyledStatusDescriptor = styled(StatusDescriptor)`
  display: inline-block;
`;
