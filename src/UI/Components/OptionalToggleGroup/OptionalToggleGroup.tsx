import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";

export interface OptionalToggleGroupOption<T extends string = string> {
  value: T;
  buttonId: string;
  label?: string;
  icon?: {
    active: React.ReactNode;
    inactive: React.ReactNode;
  };
  ariaLabel?: string;
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
 *  @prop {OptionalToggleGroupOption[]} options - The toggle options to render. Each option is shown
 *    in one of two ways: provide a `label` to render it as text, or provide an active/inactive
 *    `icon` pair together with an `ariaLabel` (the icons are decorative, so the `ariaLabel` supplies
 *    the accessible name).
 *  @prop {string[]} selected - The full list of currently active filter values. Only values matching this group's options are considered.
 *  @prop {function} onChange - Called with the updated full list after applying mutual-exclusion logic.
 *
 * @notes At most one option can be active at a time. Selecting an inactive option deactivates any
 * other option in the group. Selecting the active option deactivates it, leaving no selection.
 * Unrelated values in the selected list are preserved.
 *
 * @returns {React.ReactElement} The OptionalToggleGroup component.
 */
export const OptionalToggleGroup = <T extends string>({
  options,
  selected,
  onChange,
}: OptionalToggleGroupProps<T>): React.ReactElement => {
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
      {options.map(({ value, buttonId, label, icon, ariaLabel }) => {
        const isSelected = selected.includes(value);

        return (
          <ToggleGroupItem
            key={value}
            aria-label={label ?? ariaLabel}
            text={icon ? undefined : label}
            icon={icon ? (isSelected ? icon.active : icon.inactive) : undefined}
            buttonId={buttonId}
            isSelected={isSelected}
            onChange={() => handleChange(value)}
          />
        );
      })}
    </ToggleGroup>
  );
};
