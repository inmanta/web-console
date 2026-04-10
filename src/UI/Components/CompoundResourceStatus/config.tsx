import { ReactNode } from "react";
import { CubeIcon, ShieldAltIcon, TrafficLightIcon } from "@patternfly/react-icons";
import { t_global_icon_size_font_xl } from "@patternfly/react-tokens";
import { Resource } from "@/Core";

/** Color config which maps every compound state type to a color. */
export const colorConfig: Record<Resource.CompoundStateType, string> = {
  [Resource.BlockedState.blocked]: "var(--pf-t--color--red--60)",
  [Resource.ComplianceState.non_compliant]: "var(--pf-t--color--red--60)",
  [Resource.LastHandlerRunState.failed]: "var(--pf-t--color--red--60)",

  [Resource.BlockedState.not_blocked]: "var(--pf-t--color--green--50)",
  [Resource.ComplianceState.compliant]: "var(--pf-t--color--green--50)",
  [Resource.LastHandlerRunState.successful]: "var(--pf-t--color--green--50)",

  [Resource.BlockedState.temporarily_blocked]: "var(--pf-t--color--orange--40)",
  [Resource.ComplianceState.has_update]: "var(--pf-t--color--orange--40)",

  [Resource.ComplianceState.undefined]: "var(--pf-t--color--gray--40)",
  [Resource.LastHandlerRunState.skipped]: "var(--pf-t--color--gray--40)",

  [Resource.LastHandlerRunState.new]: "var(--pf-t--color--blue--50)",
};

/** Maps each compound state type to a numeric priority value. */
export const statusPriority: Record<Resource.CompoundStateType, number> = {
  // --- BlockedStatus ---
  [Resource.BlockedState.not_blocked]: 0,
  [Resource.BlockedState.blocked]: 1,
  [Resource.BlockedState.temporarily_blocked]: 2,
  // --- ComplianceStatus ---
  [Resource.ComplianceState.compliant]: 0,
  [Resource.ComplianceState.has_update]: 2,
  [Resource.ComplianceState.non_compliant]: 1,
  [Resource.ComplianceState.undefined]: 3,
  // --- LastHandlerRunStatus ---
  [Resource.LastHandlerRunState.successful]: 0,
  [Resource.LastHandlerRunState.failed]: 1,
  [Resource.LastHandlerRunState.new]: 2,
  [Resource.LastHandlerRunState.skipped]: 3,
};

export const iconStyle = {
  width: t_global_icon_size_font_xl.value,
  height: t_global_icon_size_font_xl.value,
};

/** We normalize the state toLowerCase since the resourceSummary has lowerCase
 * and the resources themselves return upperCase states.
 */
const resolveColor = (
  state?: Resource.CompoundStateType | Resource.CompoundStateUpperType,
  overrideColor?: string
): string | undefined => overrideColor ?? (state ? colorConfig[state.toLowerCase()] : undefined);

/** Icons for every compound state. */
export const statusGroupIcons: Record<
  keyof Resource.CompoundState,
  (options?: {
    state?: Resource.CompoundStateType | Resource.CompoundStateUpperType;
    overrideColor?: string;
  }) => ReactNode
> = {
  blocked: ({ state, overrideColor } = {}) => (
    <TrafficLightIcon style={{ ...iconStyle, color: resolveColor(state, overrideColor) }} />
  ),
  compliance: ({ state, overrideColor } = {}) => (
    <ShieldAltIcon style={{ ...iconStyle, color: resolveColor(state, overrideColor) }} />
  ),
  lastHandlerRun: ({ state, overrideColor } = {}) => (
    <CubeIcon style={{ ...iconStyle, color: resolveColor(state, overrideColor) }} />
  ),
};
