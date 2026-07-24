import React, { memo, useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { ClassifiedAttribute } from "@/Data";
import {
  AttributeExpandTd,
  AttributeExpansionRow,
  AttributeValueCell,
  DateWithTooltip,
  Link,
  useAttributeExpansion,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  attribute: ClassifiedAttribute;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = memo(
  ({ row, attribute, rowIndex, numberOfColumns, showExpandColumn }) => {
    const { routeManager } = useContext(DependencyContext);
    const { isExpandable, isExpanded, toggleExpanded } = useAttributeExpansion(attribute);

    return (
      <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
        <Tr aria-label="FactsRow">
          {showExpandColumn && (
            <AttributeExpandTd
              isExpandable={isExpandable}
              rowIndex={rowIndex}
              isExpanded={isExpanded}
              onToggle={toggleExpanded}
            />
          )}
          <Td dataLabel={words("facts.column.name")}>{row.name}</Td>
          <Td dataLabel={words("facts.column.updated")}>
            {row.updated && <DateWithTooltip timestamp={row.updated} />}
          </Td>
          <Td modifier="breakWord" dataLabel={words("facts.column.value")}>
            <AttributeValueCell
              value={row.value}
              attribute={attribute}
              isExpanded={isExpanded}
              onToggle={toggleExpanded}
            />
          </Td>
          <Td modifier="breakWord" dataLabel={words("facts.column.resourceId")}>
            <Link
              pathname={routeManager.getUrl("ResourceDetails", {
                resourceId: row.resource_id,
              })}
            >
              <Button variant="link" isInline>
                {row.resource_id}
              </Button>
            </Link>
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
  }
);
