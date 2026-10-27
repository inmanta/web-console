import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { Parameter, words } from "@inmanta/web-console-core";
import { ClassifiedAttribute } from "@inmanta/web-console-core/Common";
import {
  AttributeExpandTd,
  AttributeExpansionRow,
  AttributeValueCell,
  useAttributeExpansion,
} from "@inmanta/web-console-ui/Components/AttributeList";
import { DateWithTooltip } from "@inmanta/web-console-ui/Components/DateWithTooltip";

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
        <Td dataLabel={words("name")} width={20}>
          {row.name}
        </Td>
        <Td dataLabel={words("lastUpdated")} width={10}>
          {row.updated ? <DateWithTooltip timestamp={row.updated} /> : ""}
        </Td>
        <Td dataLabel={words("parameters.columns.source")} width={10}>
          {row.source}
        </Td>
        <Td modifier="breakWord" dataLabel={words("value")}>
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
