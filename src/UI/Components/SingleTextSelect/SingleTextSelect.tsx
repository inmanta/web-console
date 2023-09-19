import React, { useState } from "react";
import { Select, SelectOption } from "@patternfly/react-core/deprecated";

interface Props {
  selected: string | null;
  setSelected: (selected: string | null) => void;
  options: string[];
  isDisabled?: boolean;
  toggleAriaLabel?: string;
  placeholderText?: string;
}

export const SingleTextSelect: React.FC<Props> = ({
  selected,
  setSelected,
  options,
  toggleAriaLabel,
  placeholderText,
  ...props
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

  return (
    <Select
      variant="typeahead"
      onToggle={(_event, isExpanded) => onToggle(isExpanded)}
      onSelect={onSelect}
      selections={[selected]}
      isOpen={isOpen}
      toggleAriaLabel={toggleAriaLabel}
      placeholderText={placeholderText || " "}
      {...props}
    >
      {options.map((value) => (
        <SelectOption key={value} value={value} />
      ))}
    </Select>
  );
};
