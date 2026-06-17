import React, { useState, useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Tr, Td } from "@patternfly/react-table";
import { AttributeValue, DateWithTooltip, Link, isEditorKind } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";
import { classifyValue, getValuePreview } from "./helpers";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = ({ row, rowIndex, numberOfColumns, showExpandColumn }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const attribute = classifyValue(row.value);
  const isExpandable = isEditorKind(attribute.kind);
  const valuePreview = getValuePreview(row.value);

  return (
    <Tbody isExpanded={isExpandable ? isExpanded : undefined}>
      <Tr aria-label="FactsRow">
        {showExpandColumn && (
          <Td
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
              {valuePreview}
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
