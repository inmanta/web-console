import React from "react";
import { EntityShapeType } from "../Data/ServiceEntityShape";

/**
 * The colour of each kind of entity, as PatternFly's non-status colours (the colours of its
 * labels), so they follow the theme: services are yellow, embedded entities blue, and related
 * instances purple.
 */
const entityColors: Record<EntityShapeType, "yellow" | "blue" | "purple"> = {
  core: "yellow",
  embedded: "blue",
  relation: "purple",
};

/**
 * The accent of each kind of entity: the edge of its cards, and its cards in the minimap.
 */
export const HeaderColors = Object.fromEntries(
  Object.entries(entityColors).map(([type, color]) => [
    type,
    `var(--pf-t--global--border--color--nonstatus--${color}--default)`,
  ])
) as Record<EntityShapeType, string>;

/**
 * The CSS variables a card or a palette row takes its kind's colours from: the accent, and the
 * background and colour of its icon tile.
 */
export const entityColorVariables = (type: EntityShapeType) =>
  ({
    "--entity-accent": HeaderColors[type],
    "--entity-icon-background": `var(--pf-t--global--color--nonstatus--${entityColors[type]}--default)`,
    "--entity-icon-color": `var(--pf-t--global--icon--color--nonstatus--on-${entityColors[type]}--default)`,
  }) as React.CSSProperties;
