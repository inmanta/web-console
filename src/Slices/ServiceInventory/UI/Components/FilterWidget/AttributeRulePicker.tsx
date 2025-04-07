import React, { useState } from "react";
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
} from "@patternfly/react-core";

export enum AttributeRule {
  Empty = "empty",
  NotEmpty = "not empty",
}

interface Props {
  rule: AttributeRule | undefined;
  onChange: (q: AttributeRule) => void;
  isDisabled: boolean;
}

export const AttributeRulePicker: React.FC<Props> = ({
  rule,
  onChange,
  isDisabled,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(val) => setFilterOpen(val)}
      isExpanded={isFilterOpen}
      aria-label="Select Quality"
      disabled={isDisabled}
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {rule || "Select a quality..."}
    </MenuToggle>
  );

  const onSelect = (event, selection) => {
    onChange(selection);
    setFilterOpen(false);
  };

  return (
    <Select
      onOpenChange={(isOpen) => setFilterOpen(isOpen)}
      onSelect={onSelect}
      selected={rule}
      isOpen={isFilterOpen}
      toggle={toggle}
    >
      <SelectOption key={0} value="empty">
        Empty
      </SelectOption>
      <SelectOption key={1} value="not empty">
        Not Empty
      </SelectOption>
    </Select>
  );
};
