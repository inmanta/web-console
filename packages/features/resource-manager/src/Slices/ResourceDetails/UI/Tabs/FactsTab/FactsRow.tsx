import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { ClassifiedAttribute } from "@inmanta/web-console-core/Common";
import { Fact } from "@inmanta/web-console-core/Domain/Fact";
import {
  AttributeExpandTd,
  AttributeExpansionRow,
  AttributeValueCell,
  useAttributeExpansion,
} from "@inmanta/web-console-ui/Components/AttributeList";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";

const datePresenter = new CustomDatePresenter();

interface Props {
  row: Pick<Fact, "id" | "name" | "updated" | "value">;
  attribute: ClassifiedAttribute;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = ({
  row,
  attribute,
  rowIndex,
  numberOfColumns,
  showExpandColumn,
}) => {
  const { isExpandable, isExpanded, toggleExpanded } = useAttributeExpansion(attribute);

  return (
    <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
      <Tr aria-label="Facts table row">
        {showExpandColumn && (
          <AttributeExpandTd
            isExpandable={isExpandable}
            rowIndex={rowIndex}
            isExpanded={isExpanded}
            onToggle={toggleExpanded}
          />
        )}
        <Td>{row.name}</Td>
        <Td>{row.updated && datePresenter.getFull(row.updated)}</Td>
        <Td modifier="breakWord">
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
