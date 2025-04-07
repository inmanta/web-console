import React, { useState } from "react";
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
} from "@patternfly/react-core";
import { ServiceInstanceParams } from "@/Core";

interface Props {
  attributeSet: ServiceInstanceParams.AttributeSet | undefined;
  onChange: (id: ServiceInstanceParams.AttributeSet) => void;
}

export const AttributeSetPicker: React.FC<Props> = ({
  attributeSet,
  onChange,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (_event, selection) => {
    setFilterOpen(false);
    onChange(selection);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={(val) => setFilterOpen(val)}
      isExpanded={isFilterOpen}
      aria-label="Select AttributeSet"
      style={
        {
          width: "200px",
        } as React.CSSProperties
      }
    >
      {attributeSet || "Select an AttributeSet..."}
    </MenuToggle>
  );

  return (
    <Select
      toggle={toggle}
      onOpenChange={(val) => setFilterOpen(val)}
      onSelect={onSelect}
      selected={attributeSet}
      isOpen={isFilterOpen}
    >
      <SelectOption
        key={1}
        value={ServiceInstanceParams.AttributeSet.Candidate}
      >
        Candidate
      </SelectOption>
      <SelectOption key={2} value={ServiceInstanceParams.AttributeSet.Active}>
        Active
      </SelectOption>
      <SelectOption key={3} value={ServiceInstanceParams.AttributeSet.Rollback}>
        Rollback
      </SelectOption>
    </Select>
  );
};
