import { CheckCircleIcon, CheckIcon, TimesCircleIcon, TimesIcon } from "@patternfly/react-icons";

/**
 * Icon pair shown for an include/exclude control. The `active` icon (filled, coloured)
 * is rendered when the option is selected, the `inactive` icon (outlined, muted) otherwise.
 */
export interface IncludeExcludeIconPair {
  active: React.ReactNode;
  inactive: React.ReactNode;
}

export const includeIcons: IncludeExcludeIconPair = {
  active: (
    <CheckIcon
      color="var(--pf-t--global--icon--color--status--success--default)"
      aria-hidden="true"
    />
  ),
  inactive: (
    <CheckCircleIcon color="var(--pf-t--global--icon--color--disabled)" aria-hidden="true" />
  ),
};

export const excludeIcons: IncludeExcludeIconPair = {
  active: (
    <TimesIcon
      color="var(--pf-t--global--icon--color--status--danger--default)"
      aria-hidden="true"
    />
  ),
  inactive: (
    <TimesCircleIcon color="var(--pf-t--global--icon--color--disabled)" aria-hidden="true" />
  ),
};
