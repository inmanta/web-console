import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { Parameter } from "@/Core";
import { ClassifiedAttribute } from "@/Data";
import {
  AttributeExpandTd,
  AttributeExpansionRow,
  AttributeValueCell,
  DateWithTooltip,
  useAttributeExpansion,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  row: Parameter;
  attribute: ClassifiedAttribute;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const ParametersTableRow: React.FC<Props> = ({
  row,
  attribute,
  rowIndex,
  numberOfColumns,
  showExpandColumn,
}) => {
  const { isExpandable, isExpanded, toggleExpanded } = useAttributeExpansion(attribute);

  return (
    <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
      <Tr aria-label="Parameters Table Row">
        {showExpandColumn && (
          <AttributeExpandTd
            isExpandable={isExpandable}
            rowIndex={rowIndex}
            isExpanded={isExpanded}
            onToggle={toggleExpanded}
          />
        )}
        <Td dataLabel={words("parameters.columns.name")} width={20}>
          {row.name}
        </Td>
        <Td dataLabel={words("parameters.columns.updated")} width={10}>
          {row.updated ? <DateWithTooltip timestamp={row.updated} /> : ""}
        </Td>
        <Td dataLabel={words("parameters.columns.source")} width={10}>
          {row.source}
        </Td>
        <Td modifier="breakWord" dataLabel={words("parameters.columns.value")}>
          <AttributeValueCell
            value={row.value}
            attribute={attribute}
            isExpanded={isExpanded}
            onToggle={toggleExpanded}
          />
        </Td>
      </Tr>
      {isExpandable && (
        <AttributeExpansionRow
          isExpanded={isExpanded}
          colSpan={numberOfColumns}
          attribute={attribute}
        />
      )}
    </Tbody>
  );
};
