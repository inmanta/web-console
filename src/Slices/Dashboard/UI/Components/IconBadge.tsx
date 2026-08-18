import styled from "styled-components";
import { HealthStatus } from "./EnvironmentHealth/StatusIndicator";

export type IconTone = "success" | "danger" | "info" | "warning" | "brand";

export const TONE_COLOR: Record<IconTone, string> = {
  success: "var(--pf-t--global--icon--color--status--success--default)",
  danger: "var(--pf-t--global--icon--color--status--danger--default)",
  info: "var(--pf-t--global--icon--color--status--info--default)",
  warning: "var(--pf-t--global--icon--color--status--warning--default)",
  // The same blue used by links elsewhere in this UI (Button variant="link", e.g. "View report >").
  brand: "var(--pf-t--global--icon--color--brand--default)",
};

/**
 * Maps EnvironmentHealthRow's healthy/attention/danger vocabulary onto IconTone, so cards that
 * derive a HealthStatus can color their title icon consistently with the top health row.
 */
export const HEALTH_TONE: Record<HealthStatus, IconTone> = {
  healthy: "success",
  attention: "warning",
  danger: "danger",
};

const BADGE_SIZE = { sm: "1.75rem", md: "2rem", lg: "2.5rem" };
const ICON_SIZE = { sm: "1rem", md: "1.125rem", lg: "1.375rem" };

/**
 * A small circular badge: a low-opacity tinted background behind a muted-color icon. The
 * "lighter" icon treatment used across Dashboard V2 instead of PatternFly's bold solid status
 * icon colors. Defaults to "md" (the panel header icon); pass $size="sm" for the smaller
 * per-row icons, or $size="lg" for the larger card-level icon (e.g. the Orchestrator card's
 * operational verdict).
 */
interface IconBadgeProps {
  $tone: IconTone;
  $size?: "sm" | "md" | "lg";
  "data-tone"?: IconTone;
}

export const IconBadge = styled.div.attrs<IconBadgeProps>(({ $tone }) => ({
  // Exposes the semantic tone as a plain DOM attribute so tests can assert "which tone is this"
  // without matching IconBadge's exact color-mix/PF-token CSS recipe.
  "data-tone": $tone,
}))<IconBadgeProps>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${(props) => BADGE_SIZE[props.$size ?? "md"]};
  height: ${(props) => BADGE_SIZE[props.$size ?? "md"]};
  border-radius: 50%;
  background-color: color-mix(in srgb, ${(props) => TONE_COLOR[props.$tone]} 15%, transparent);
  color: color-mix(in srgb, ${(props) => TONE_COLOR[props.$tone]} 70%, white);

  svg {
    width: ${(props) => ICON_SIZE[props.$size ?? "md"]};
    height: ${(props) => ICON_SIZE[props.$size ?? "md"]};
  }
`;
