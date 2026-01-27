import React from "react";
import { Label, LabelGroup } from "@patternfly/react-core";
import { words } from "@/UI/words";

export interface ActiveFilterGroupProps {
  title: string;
  values?: string[];
  onRemove: (value: string) => void;
  onRemoveGroup?: () => void;
}

/**
 * The ActiveFilterGroup component.
 *
 * This component is responsible of rendering the active values of a single filter category as a dismissible label group.
 *
 * @Props {ActiveFilterGroupProps} - Component props.
 *  @prop {string} title - Display name for the category heading.
 *  @prop {string[]} [values] - Current chip values that belong to the category.
 *  @prop {(value: string) => void} onRemove - Callback executed when an individual chip is dismissed.
 *  @prop {() => void} [onRemoveGroup] - Callback executed when the entire label group is closed.
 *
 * @returns {React.ReactElement | null} The rendered label group or null if no values are present.
 */
export const ActiveFilterGroup: React.FC<ActiveFilterGroupProps> = ({
  title,
  values,
  onRemove,
  onRemoveGroup,
}) => {
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <LabelGroup
      categoryName={title}
      isCompact
      isClosable={Boolean(onRemoveGroup)}
      onClick={onRemoveGroup}
      isEditable
      closeBtnAriaLabel={
        onRemoveGroup ? words("resources.filters.active.group.close")(title) : undefined
      }
    >
      {values.map((value) => (
        <Label
          key={value}
          color={value.startsWith("!") ? "red" : "grey"}
          onClose={() => onRemove(value)}
        >
          {value}
        </Label>
      ))}
    </LabelGroup>
  );
};
