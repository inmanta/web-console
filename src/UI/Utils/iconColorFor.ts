/**
 * PatternFly's `Icon` sets its own default icon color on the wrapper, shadowing any
 * inherited `color`. react-icons' explicit `color` prop wins over that as an inline
 * style, so icon coloring for a menu item goes through `DynamicFAIcon`'s `color` prop,
 * not CSS. Shared by `StateAction.tsx` and `SetStateSection.tsx`.
 *
 * @param {string} [variant] - the transfer's `web_button_variant` annotation
 * @returns {string | undefined} the CSS color for the icon, or undefined for no override
 */
export const iconColorFor = (variant?: string): string | undefined => {
  if (variant === "danger") {
    return "var(--pf-t--global--icon--color--status--danger--default)";
  }

  if (variant === "warning") {
    return "var(--pf-t--global--icon--color--status--warning--default)";
  }

  return undefined;
};
