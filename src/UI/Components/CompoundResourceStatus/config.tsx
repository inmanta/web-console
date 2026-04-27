import { ReactNode } from "react";
import { Icon } from "@patternfly/react-core";
import { CubeIcon, ShieldAltIcon, TrafficLightIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";

/** Status config which maps the compound state types to a displayed string output.
 * Used in the ResourceTableRow.
 */
export const statusMapping: Record<Resource.CompoundState, string> = {
  // --- Blocked --
  BLOCKED: "Blocked",
  NOT_BLOCKED: "Not Blocked",
  TEMPORARILY_BLOCKED: "Temporarily Blocked",
  // --- Compliance ---
  COMPLIANT: "Compliant",
  NON_COMPLIANT: "Non Compliant",
  HAS_UPDATE: "Has Update",
  UNDEFINED: "Undefined",
  // --- LastHandlerRun ---
  FAILED: "Failed",
  SKIPPED: "Skipped",
  SUCCESSFUL: "Successful",
  NEW: "New",
};

/** Color config which maps every compound state type to a color. */
export const colorConfig: Record<Resource.CompoundStateKey, string> = {
  // --- Blocked --
  blocked: "var(--pf-t--color--red--60)",
  not_blocked: "var(--pf-t--color--green--50)",
  temporarily_blocked: "var(--pf-t--color--orange--40)",
  // --- Compliance ---
  compliant: "var(--pf-t--color--green--50)",
  non_compliant: "var(--pf-t--color--red--60)",
  has_update: "var(--pf-t--color--orange--40)",
  undefined: "var(--pf-t--color--gray--40)",
  // --- LastHandlerRun ---
  failed: "var(--pf-t--color--red--60)",
  skipped: "var(--pf-t--color--gray--40)",
  successful: "var(--pf-t--color--green--50)",
  new: "var(--pf-t--color--blue--50)",
};

/** Maps each compound state type to a numeric priority value. */
export const statusPriority: Record<Resource.CompoundStateKey, number> = {
  // --- Blocked---
  not_blocked: 0,
  blocked: 1,
  temporarily_blocked: 2,
  // --- Compliance ---
  compliant: 0,
  non_compliant: 1,
  has_update: 2,
  undefined: 3,
  // --- LastHandlerRun ---
  successful: 0,
  failed: 1,
  new: 2,
  skipped: 3,
};

/** default is the neutral icons color and state is whenever the colorConfig should be used for the icons. */
type ColorVariant = "default" | "state";

const DEFAULT_COLOR = "var(--pf-t--global--icon--color--severity--minor--default)";

/** Resolves the correct colors for every compound state Icon. */
const resolveColor = (variant: ColorVariant = "state", state?: Resource.CompoundState): string => {
  if (variant === "default") return DEFAULT_COLOR;

  const key = state?.toLowerCase() as Resource.CompoundStateKey | undefined;
  return key !== undefined && key in colorConfig ? colorConfig[key] : DEFAULT_COLOR;
};

/** Icons for every compound state. */
export const statusGroupIcons: Record<
  keyof Resource.CompoundStateSummary,
  (options?: { state?: Resource.CompoundState; variant?: ColorVariant }) => ReactNode
> = {
  blocked: ({ state, variant } = {}) => (
    <Icon size="heading_2xl">
      <TrafficLightIcon style={{ color: resolveColor(variant, state) }} />
    </Icon>
  ),

  compliance: ({ state, variant } = {}) => (
    <Icon size="heading_2xl">
      <ShieldAltIcon style={{ color: resolveColor(variant, state) }} />
    </Icon>
  ),

  lastHandlerRun: ({ state, variant } = {}) => (
    <Icon size="heading_2xl">
      <CubeIcon style={{ color: resolveColor(variant, state) }} />
    </Icon>
  ),
};
