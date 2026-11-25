import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import {
  DiffSideLabels,
  EntryInfo,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { AttributeCells } from "./AttributeCells";
import { AttributeName } from "./AttributeName";
import { FileContentDiff } from "./FileContentDiff";
import { LongValueDiff } from "./LongValueDiff";
import { isFileHash, isLongValue } from "./helpers";
import { ATTRIBUTE_TABLE_COLUMN_COUNT, DIFF_SIDES, DiffSide } from "./types";

interface Props extends DiffSideLabels {
  resourceId: string;
  entries: EntryInfo[];
  sidesWithValues: DiffSide[];
  isTableHeaderStuck: boolean;
}

/**
 * The attributes of one resource in a compact table with a column per side of the diff, its header
 * sticking to the top of the scrolling diff. It stays a table on small screens. Short values sit
 * in the columns with the changed part marked, and a side without values says so. Long values and
 * file content get a line diff in a row under their name, which names its own sides, so without
 * short values the table has no column headers.
 *
 * @props {Props} props - The component props
 *  @prop {string} resourceId - The id of the resource, which tells whether its hash is file content
 *  @prop {EntryInfo[]} entries - The attributes and their values on both sides
 *  @prop {DiffSide[]} sidesWithValues - The sides that hold values, both unless the resource is added or deleted
 *  @prop {string} fromLabel - The header of the column of the side the diff starts from
 *  @prop {string} toLabel - The header of the column of the side the diff goes to
 *  @prop {boolean} isTableHeaderStuck - Whether the diff is scrolled, so the header shows as stuck
 *
 * @returns {React.FC<Props>} The attribute table
 */
export const AttributeTable: React.FC<Props> = ({
  resourceId,
  entries,
  sidesWithValues,
  fromLabel,
  toLabel,
  isTableHeaderStuck,
}) => {
  const labels: Record<DiffSide, string> = { from: fromLabel, to: toLabel };
  const hasShortValues = entries.some(({ fromValue, toValue }) => !isLongValue(fromValue, toValue));

  const renderAttributeRows = (attributeName: string, fromValue: string, toValue: string) => {
    if (isLongValue(fromValue, toValue)) {
      return (
        <>
          <Tr>
            <AttributeName scope="rowgroup" colSpan={ATTRIBUTE_TABLE_COLUMN_COUNT}>
              {attributeName}
            </AttributeName>
          </Tr>
          <Tr>
            <Td colSpan={ATTRIBUTE_TABLE_COLUMN_COUNT}>
              <LongValueDiff
                attributeName={attributeName}
                fromValue={fromValue}
                toValue={toValue}
                fromLabel={fromLabel}
                toLabel={toLabel}
              />
            </Td>
          </Tr>
        </>
      );
    }

    if (isFileHash(resourceId, attributeName)) {
      return (
        <FileContentDiff
          attributeName={attributeName}
          fromHash={fromValue}
          toHash={toValue}
          fromLabel={fromLabel}
          toLabel={toLabel}
          sidesWithValues={sidesWithValues}
        />
      );
    }

    return (
      <Tr>
        <AttributeCells
          attributeName={attributeName}
          fromValue={fromValue}
          toValue={toValue}
          sidesWithValues={sidesWithValues}
        />
      </Tr>
    );
  };

  return (
    <Table
      variant="compact"
      gridBreakPoint=""
      role="table"
      isStickyHeaderBase
      isStickyHeaderStuck={isTableHeaderStuck}
      aria-label={words("desiredState.compare.attributes")(resourceId)}
    >
      {hasShortValues && (
        <Thead>
          <Tr>
            <Th width={20} isSubheader>
              {words("attribute")}
            </Th>
            {DIFF_SIDES.map((side) => (
              <Th key={side} width={40} isSubheader>
                {labels[side]}
              </Th>
            ))}
          </Tr>
        </Thead>
      )}
      {entries.map(({ title: attributeName, fromValue, toValue }) => (
        <Tbody key={attributeName}>{renderAttributeRows(attributeName, fromValue, toValue)}</Tbody>
      ))}
    </Table>
  );
};
