import React, { useMemo, useState } from "react";
import { Button, Truncate } from "@patternfly/react-core";
import { ExpandableRowContent, Td, Tr } from "@patternfly/react-table";
import { ClassifiedAttribute } from "@/Data";
import { AttributeClassifier } from "@/Data/Common/AttributeClassifier/AttributeClassifier";
import { AttributeValue } from "./AttributeList";
import { isEditorKind } from "./helpers";

const classifier = new AttributeClassifier();

/**
 * A table row paired with the classification of its value, as produced by
 * {@link useClassifiedRows}.
 *
 * @template Row - The original row type.
 */
export interface ClassifiedRow<Row> {
  row: Row;
  attribute: ClassifiedAttribute;
}

/**
 * Classifies every row's `value` so a table can render each one according to
 * its content (JSON, XML, multiline code, or plain text) and decide whether the
 * extra expand column is needed at all.
 *
 * @param rows - The rows to classify; each must carry a string `value`.
 * @returns The classified rows and whether any of them render in the expandable
 *   code editor (`hasExpandableRows`).
 */
export function useClassifiedRows<Row extends { value: string }>(
  rows: Row[]
): { classifiedRows: ClassifiedRow<Row>[]; hasExpandableRows: boolean } {
  return useMemo(() => {
    const classifiedRows = rows.map((row) => ({
      row,
      attribute: classifier.classify({ value: row.value })[0],
    }));

    return {
      classifiedRows,
      hasExpandableRows: classifiedRows.some(({ attribute }) => isEditorKind(attribute.kind)),
    };
  }, [rows]);
}

/**
 * Per-row expansion state for a classified attribute. `isExpandable` reflects
 * whether the attribute renders in the code editor at all; rows that are not
 * expandable simply ignore the toggle.
 *
 * @param attribute - The classified attribute rendered in the row.
 */
export function useAttributeExpansion(attribute: ClassifiedAttribute): {
  isExpandable: boolean;
  isExpanded: boolean;
  toggleExpanded: () => void;
} {
  const [isExpanded, setIsExpanded] = useState(false);

  return {
    isExpandable: isEditorKind(attribute.kind),
    isExpanded,
    toggleExpanded: () => setIsExpanded((prev) => !prev),
  };
}

/**
 * The leading expand-toggle cell for a table that has expandable rows. Rows
 * whose value is not expandable render an empty cell so columns stay aligned.
 *
 * @param isExpandable - Whether this row's value can be expanded.
 * @param rowIndex - The row's index, required by PatternFly for the toggle.
 * @param isExpanded - Whether the expansion row is currently open.
 * @param onToggle - Toggles the expansion row.
 */
export const AttributeExpandTd: React.FC<{
  isExpandable: boolean;
  rowIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ isExpandable, rowIndex, isExpanded, onToggle }) => (
  <Td expand={isExpandable ? { rowIndex, isExpanded, onToggle } : undefined} />
);

/**
 * The content of a value cell. Expandable kinds (JSON, XML, multiline code)
 * show a truncated preview button that toggles the expansion row; everything
 * else renders inline via {@link AttributeValue} (copyable text, file block, ...).
 *
 * @param value - The raw value, shown truncated in the preview button.
 * @param attribute - The classified attribute.
 * @param isExpanded - Whether the expansion row is currently open.
 * @param onToggle - Toggles the expansion row.
 */
export const AttributeValueCell: React.FC<{
  value: string;
  attribute: ClassifiedAttribute;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ value, attribute, isExpanded, onToggle }) =>
  isEditorKind(attribute.kind) ? (
    <Button variant="link" isInline onClick={onToggle} aria-expanded={isExpanded}>
      <Truncate
        content={value}
        maxCharsDisplayed={30}
        tooltipProps={{ isVisible: false, trigger: "manual" }}
      />
    </Button>
  ) : (
    <AttributeValue attribute={attribute} />
  );

/**
 * The full-width row revealed when an expandable value is opened, rendering the
 * value in the read-only code editor.
 *
 * @param isExpanded - Whether the row is open.
 * @param colSpan - The number of columns the row should span.
 * @param attribute - The classified attribute to render.
 */
export const AttributeExpansionRow: React.FC<{
  isExpanded: boolean;
  colSpan: number;
  attribute: ClassifiedAttribute;
}> = ({ isExpanded, colSpan, attribute }) => (
  <Tr isExpanded={isExpanded}>
    <Td colSpan={colSpan}>
      <ExpandableRowContent>
        <AttributeValue attribute={attribute} />
      </ExpandableRowContent>
    </Td>
  </Tr>
);
