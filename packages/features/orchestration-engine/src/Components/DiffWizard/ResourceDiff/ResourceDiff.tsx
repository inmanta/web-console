import React from "react";
import {
  DiffSideLabels,
  Item,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { AttributeTable } from "./AttributeTable";
import { StatusAlert } from "./StatusAlert";
import { getSidesWithValues } from "./helpers";

interface Props extends DiffSideLabels {
  item: Item;
  isTableHeaderStuck: boolean;
}

/**
 * The diff of one resource: a note on its status, then its attributes in a table with a column
 * per side of the diff, whose header sticks to the top of the scrolling diff. The table sits flush
 * in the pane and brings its own side inset, like PatternFly tables do.
 *
 * @props {Props} props - The component props
 *  @prop {Item} item - The resource and its changed attributes
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *  @prop {boolean} isTableHeaderStuck - Whether the diff is scrolled, so the table header shows as stuck
 *
 * @returns {React.FC<Props>} The resource diff
 */
export const ResourceDiff: React.FC<Props> = ({ item, fromLabel, toLabel, isTableHeaderStuck }) => (
  <>
    <StatusAlert resourceId={item.id} status={item.status} />
    {item.entries.length > 0 && (
      <AttributeTable
        resourceId={item.id}
        entries={item.entries}
        sidesWithValues={getSidesWithValues(item.status)}
        fromLabel={fromLabel}
        toLabel={toLabel}
        isTableHeaderStuck={isTableHeaderStuck}
      />
    )}
  </>
);
