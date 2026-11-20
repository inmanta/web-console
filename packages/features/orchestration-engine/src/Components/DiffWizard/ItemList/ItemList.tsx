import React from "react";
import { DataList } from "@patternfly/react-core";
import {
  DiffSideLabels,
  Item,
  Refs,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { Block } from "./Block";

interface Props extends DiffSideLabels {
  items: Item[];
  refs: Refs;
}

/**
 * The resources of a diff, as a compact data list with one expandable row per resource.
 *
 * @props {Props} props - The component props
 *  @prop {Item[]} items - The resources and their changes
 *  @prop {Refs} refs - Where the rows register themselves, so the jump-to list can scroll to them
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *
 * @returns {React.FC<Props>} The list of diff rows
 */
export const ItemList: React.FC<Props> = ({ items, refs, fromLabel, toLabel }) => (
  <DataList isCompact aria-label="DiffItemList">
    {items.map((item) => (
      <Block key={item.id} item={item} refs={refs} fromLabel={fromLabel} toLabel={toLabel} />
    ))}
  </DataList>
);
