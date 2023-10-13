import React, { useState } from "react";
import { Select, SelectOption } from "@patternfly/react-core/deprecated";

interface Props {
  selected: string[];
  setSelected: (
    selected: string[] | ((prevState: string[]) => string[]),
  ) => void;
  options: string[];
  isDisabled?: boolean;
  toggleAriaLabel?: string;
}

export const MultiTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
  toggleAriaLabel,
  ...props
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
      onToggle={(_event, isExpanded) => onToggle(isExpanded)}
      onSelect={onSelect}
      selections={selected}
      isOpen={isOpen}
      toggleAriaLabel={toggleAriaLabel}
      {...props}
    >
      {options.map((value, index) => (
        <SelectOption key={index} value={value} />
      ))}
    </Select>
  );
};
