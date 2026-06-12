import React, { useState, useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Tr, Td } from "@patternfly/react-table";
import { DateWithTooltip, Link, ReadOnlyCodeEditor } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";
import { detectLanguage, getFormattedValue, getValuePreview } from "./helpers";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = ({ row, rowIndex, numberOfColumns, showExpandColumn }) => {
  const { routeManager } = useContext(DependencyContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const language = detectLanguage(row.value);
  const isExpandable = language !== null;
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
      {language !== null && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <ReadOnlyCodeEditor value={getFormattedValue(row.value)} language={language} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
