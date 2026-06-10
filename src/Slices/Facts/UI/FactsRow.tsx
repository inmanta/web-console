import React, { useState, useContext } from "react";
import { CodeEditor } from "@patternfly/react-code-editor";
import { Button } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Tr, Td } from "@patternfly/react-table";
import { DateWithTooltip, Link } from "@/UI/Components";
import { CodeEditorCopyControl } from "@/UI/Components/CodeEditorControls";
import { useTheme } from "@/UI/Components/DarkmodeOption";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";
import { LANGUAGE_MAP, detectValueType, getCodeContent, getValuePreview } from "./helpers";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
  rowIndex: number;
  numberOfColumns: number;
  showExpandColumn: boolean;
}

export const FactsRow: React.FC<Props> = ({ row, rowIndex, numberOfColumns, showExpandColumn }) => {
  const { routeManager } = useContext(DependencyContext);
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const valueType = detectValueType(row.value);
  const isExpandable = valueType !== "plain";
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
      {isExpandable && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <CodeEditor
                isReadOnly
                isDarkTheme={isDark}
                code={getCodeContent(row.value, valueType)}
                language={LANGUAGE_MAP[valueType]}
                isLanguageLabelVisible
                isDownloadEnabled
                customControls={<CodeEditorCopyControl code={row.value} />}
                height="200px"
              />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
