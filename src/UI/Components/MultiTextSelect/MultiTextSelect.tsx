import { Select, SelectOption } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  selected: string[];
  setSelected: (
    selected: string[] | ((prevState: string[]) => string[])
  ) => void;
  options: string[];
  isDisabled?: boolean;
}

export const MultiTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (e, value) => {
    if (selected.includes(value)) {
      setSelected((prev) => prev.filter((item) => item !== value));
    } else {
      setSelected((prev) => [...prev, value]);
    }
    setIsOpen(false);
  };

  const onToggle = (isExpanded) => {
    setIsOpen(isExpanded);
  };

  return (
    <Select
      variant="checkbox"
      aria-label="Select Input"
      onToggle={onToggle}
      onSelect={onSelect}
      selections={selected}
      isOpen={isOpen}
    >
      {options.map((value, index) => (
        <SelectOption key={index} value={value} />
      ))}
    </Select>
  );
};
