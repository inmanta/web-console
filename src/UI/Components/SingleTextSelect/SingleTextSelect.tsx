import { Select, SelectOption } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  selected: string | null;
  setSelected: (selected: string | null) => void;
  options: string[];
  isDisabled?: boolean;
}

export const SingleTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (e, value) => {
    if (selected === value) {
      setSelected(null);
    } else {
      setSelected(value);
    }
    setIsOpen(false);
  };

  const onToggle = (isExpanded) => {
    setIsOpen(isExpanded);
  };

  const newOptions = selected === null ? ["", ...options] : options;

  return (
    <Select
      variant="single"
      aria-label="Select Input"
      onToggle={onToggle}
      onSelect={onSelect}
      selections={[selected]}
      isOpen={isOpen}
    >
      {newOptions.map((value) => (
        <SelectOption key={value} value={value} />
      ))}
    </Select>
  );
};
