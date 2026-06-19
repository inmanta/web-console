import React, { useState, useContext } from "react";
import { Button, Truncate } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Tr, Td } from "@patternfly/react-table";
import { ClassifiedAttribute } from "@/Data";
import { AttributeValue, DateWithTooltip, Link, isEditorKind } from "@/UI/Components";
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

export const FactsRow: React.FC<Props> = ({
  row,
  attribute,
  rowIndex,
  numberOfColumns,
  showExpandColumn,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandable = isEditorKind(attribute.kind);

  return (
    <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
      <Tr aria-label="FactsRow">
        {showExpandColumn && (
          <Td
            aria-expanded={isExpanded}
            expand={
              isExpandable
                ? {
                    rowIndex,
                    isExpanded,
                    onToggle: () => setIsExpanded((prev) => !prev),
                  }
                : undefined
            }
          />
        )}
        <Td dataLabel={words("facts.column.name")}>{row.name}</Td>
        <Td dataLabel={words("facts.column.updated")}>
          {row.updated && <DateWithTooltip timestamp={row.updated} />}
        </Td>
        <Td modifier="breakWord" dataLabel={words("facts.column.value")}>
          {isExpandable ? (
            <Button variant="link" isInline onClick={() => setIsExpanded((prev) => !prev)}>
              <Truncate content={row.value} />
            </Button>
          ) : (
            <AttributeValue attribute={attribute} />
          )}
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
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <AttributeValue attribute={attribute} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
