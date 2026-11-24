import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import styled from "styled-components";
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
            <AttributeName scope="row" colSpan={ATTRIBUTE_TABLE_COLUMN_COUNT}>
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
          resourceId={resourceId}
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
    <TableWithoutInset
      variant="compact"
      borders={false}
      gridBreakPoint=""
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
      <AttributeRows>
        {entries.map(({ title: attributeName, fromValue, toValue }, index) => (
          <React.Fragment key={attributeName}>
            {index > 0 && <AttributeDivider />}
            {renderAttributeRows(attributeName, fromValue, toValue)}
          </React.Fragment>
        ))}
      </AttributeRows>
    </TableWithoutInset>
  );
};

/**
 * The line between two attributes, so an attribute name and the line diff under it read as one.
 *
 * @returns {React.FC} The divider row
 */
const AttributeDivider: React.FC = () => (
  <Tr isBorderRow aria-hidden>
    <Td colSpan={ATTRIBUTE_TABLE_COLUMN_COUNT} noPadding />
  </Tr>
);

/**
 * The table without the inset of its first and last column, so the attribute names line up with
 * the header of the diff pane above it.
 *
 * @note This sets PatternFly's internal `--pf-v6-c-table--cell--first-last-child--PaddingInline`,
 * so check it on a PatternFly major upgrade.
 */
const TableWithoutInset = styled(Table)`
  && {
    --pf-v6-c-table--cell--first-last-child--PaddingInline: 0;
  }
`;

/**
 * The attribute rows, with their cells on the first line of text instead of the app's centered
 * table rows, so a value that wraps or has a button under it doesn't move the other cells down.
 */
const AttributeRows = styled(Tbody)`
  & > tr {
    vertical-align: baseline;
  }
`;
