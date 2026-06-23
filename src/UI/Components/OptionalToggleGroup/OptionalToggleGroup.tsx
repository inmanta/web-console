import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import { IncludeExcludeIconPair } from "../IncludeExcludeIcons";

export type OptionalToggleGroupOption<T extends string | boolean = string> = {
  value: T;
  buttonId: string;
} & (
  | { label: string; icon?: never; ariaLabel?: never }
  | { icon: IncludeExcludeIconPair; ariaLabel: string; label?: never }
);

export interface OptionalToggleGroupProps<T extends string | boolean = string> {
  options: OptionalToggleGroupOption<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  isDisabled?: boolean;
}

/**
 * OptionalToggleGroup component.
 *
 * @props {OptionalToggleGroupProps} props - The props of the component.
 *  @prop {OptionalToggleGroupOption[]} options - The toggle options to render. Each option is shown
 *    in one of two ways: provide a `label` to render it as text, or provide an active/inactive
 *    `icon` pair together with an `ariaLabel` (the icons are decorative, so the `ariaLabel` supplies
 *    the accessible name).
 *  @prop {T[]} selected - The full list of currently active values (`T` is the option value type,
 *    `string | boolean`). Only values matching this group's options are considered.
 *  @prop {function} onChange - Called with the updated `T[]` list after applying mutual-exclusion logic.
 *  @prop {boolean} [isDisabled] - When true, all options are disabled and cannot be toggled.
 *
 * @notes At most one option can be active at a time. Selecting an inactive option deactivates any
 * other option in the group. Selecting the active option deactivates it, leaving no selection.
 * Unrelated values in the selected list are preserved.
 *
 * @returns {React.ReactElement} The OptionalToggleGroup component.
 */
export const OptionalToggleGroup = <T extends string | boolean>({
  options,
  selected,
  onChange,
  isDisabled = false,
}: OptionalToggleGroupProps<T>): React.ReactElement => {
  const optionValues = options.map((option) => option.value);

  const handleChange = (value: T, target: EventTarget | null) => {
    const isSelected = selected.includes(value);
    const next = isSelected
      ? selected.filter((status) => status !== value)
      : [...selected.filter((status) => !optionValues.includes(status)), value];
    onChange(next);

    // This is essentially a workaround for Patternfly's internal behaviour of the ToggleGroup.
    // We don't want a button to stay active/focused after deselect.
    // Can possibly be removed in future versions of Patternfly whenever they address this.
    if (isSelected && target instanceof HTMLElement) {
      target.blur();
    }
  };

  return (
    <ToggleGroup>
      {options.map(({ value, buttonId, label, icon, ariaLabel }) => {
        const isSelected = selected.includes(value);

        return (
          <ToggleGroupItem
            key={buttonId}
            aria-label={icon ? ariaLabel : undefined}
            text={icon ? undefined : label}
            icon={icon ? (isSelected ? icon.active : icon.inactive) : undefined}
            buttonId={buttonId}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onChange={(event) => handleChange(value, event.currentTarget)}
          />
        );
      })}
    </ToggleGroup>
  );
};
