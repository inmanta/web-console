import React from "react";
import { Stack } from "@patternfly/react-core";
import {
  DiffSideLabels,
  Item,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { AttributeTable } from "./AttributeTable";
import { StatusAlert } from "./StatusAlert";
import { getSidesWithValues } from "./helpers";

interface Props extends DiffSideLabels {
  item: Item;
}

/**
 * The diff of one resource: a note on its status, then its attributes in a table with a column
 * per side of the diff.
 *
 * @props {Props} props - The component props
 *  @prop {Item} item - The resource and its changed attributes
 *  @prop {string} fromLabel - The display text of the side the diff starts from, e.g. "Current state"
 *  @prop {string} toLabel - The display text of the side the diff goes to, e.g. "v412"
 *
 * @returns {React.FC<Props>} The resource diff
 */
export const ResourceDiff: React.FC<Props> = ({ item, fromLabel, toLabel }) => (
  <Stack hasGutter>
    <StatusAlert resourceId={item.id} status={item.status} />
    {item.entries.length > 0 && (
      <AttributeTable
        resourceId={item.id}
        entries={item.entries}
        sidesWithValues={getSidesWithValues(item.status)}
        fromLabel={fromLabel}
        toLabel={toLabel}
      />
    )}
  </Stack>
);
