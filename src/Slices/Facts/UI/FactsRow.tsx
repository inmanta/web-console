import React, { useState, useContext } from "react";
import { Button, CodeBlock, CodeBlockAction, CodeBlockCode } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Tr, Td } from "@patternfly/react-table";
import { ClipboardCopyButton, DateWithTooltip, Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";

function isJsonObject(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  numberOfColumns: number;
}

export const FactsRow: React.FC<Props> = ({ row, numberOfColumns }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const valueIsJson = isJsonObject(row.value);
  const formattedJson = valueIsJson ? JSON.stringify(JSON.parse(row.value), null, 2) : null;

  return (
    <Tbody isExpanded={valueIsJson ? isExpanded : undefined}>
      <Tr aria-label="FactsRow">
        <Td dataLabel={words("facts.column.name")}>{row.name}</Td>
        <Td dataLabel={words("facts.column.updated")}>
          {row.updated && <DateWithTooltip timestamp={row.updated} />}
        </Td>
        <Td modifier="breakWord" dataLabel={words("facts.column.value")}>
          {valueIsJson ? (
            <Button variant="link" isInline onClick={() => setIsExpanded((prev) => !prev)}>
              {words("facts.value.viewButton")}
            </Button>
          ) : (
            row.value
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
      {valueIsJson && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <CodeBlock
                actions={
                  <CodeBlockAction>
                    <ClipboardCopyButton value={formattedJson ?? ""} />
                  </CodeBlockAction>
                }
              >
                <CodeBlockCode>{formattedJson}</CodeBlockCode>
              </CodeBlock>
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
