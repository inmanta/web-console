import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";

export interface OptionalToggleGroupOption<T extends string = string> {
  label: string;
  value: T;
  buttonId: string;
}

export interface OptionalToggleGroupProps<T extends string = string> {
  options: OptionalToggleGroupOption<T>[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * OptionalToggleGroup component.
 *
 * @props {OptionalToggleGroupProps} props - The props of the component.
 *  @prop {OptionalToggleGroupOption[]} options - The toggle options to render.
 *  @prop {string[]} selected - The full list of currently active filter values. Only values matching this group's options are considered.
 *  @prop {function} onChange - Called with the updated full list after applying mutual-exclusion logic.
 *
 * @notes At most one option can be active at a time. Selecting an inactive option deactivates any
 * other option in the group. Selecting the active option deactivates it, leaving no selection.
 * Unrelated values in the selected list are preserved.
 *
 * @returns {React.FC} The OptionalToggleGroup component.
 */
export const OptionalToggleGroup = <T extends string>({
  options,
  selected,
  onChange,
}: OptionalToggleGroupProps<T>) => {
  const optionValues = options.map((option) => option.value);

  const handleChange = (value: T) => {
    const isSelected = selected.includes(value);
    const next = isSelected
      ? selected.filter((status) => status !== value)
      : [...selected.filter((status) => !optionValues.includes(status as T)), value];
    onChange(next);
  };

  return (
    <ToggleGroup>
      {options.map(({ label, value, buttonId }) => (
        <ToggleGroupItem
          key={value}
          text={label}
          buttonId={buttonId}
          isSelected={selected.includes(value)}
          onChange={() => handleChange(value)}
        />
      ))}
    </ToggleGroup>
  );
};
