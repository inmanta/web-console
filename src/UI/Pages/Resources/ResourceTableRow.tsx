import React, { useRef, useState } from "react";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { ResourceRow } from "@/Core";
import { words } from "@/UI/words";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  row: ResourceRow;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const ResourceTableRow: React.FC<Props> = ({
  row,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Details);
  const rowRef = useRef<HTMLSpanElement>(null);
  const openTabAndScrollTo = (tab: TabKey) => () => {
    setActiveTab(tab);
    if (!isExpanded) {
      onToggle();
    }
    // Make sure the scroll happens after the rendering
    setTimeout(() => {
      if (rowRef.current !== null) {
        rowRef.current.scrollIntoView({ block: "center" });
      }
    }, 0);
  };
  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Resource Table Row">
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
        <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
        <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
        <Td
          dataLabel={words("resources.column.numberOfDependencies")}
          onClick={openTabAndScrollTo(TabKey.Requires)}
        >
          <span ref={rowRef} />
          {row.numberOfDependencies}
        </Td>
        <Td dataLabel={words("resources.column.deployState")}>
          {row.deployState}
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded} data-testid={`details_${row.id}`}>
          <Td colSpan={numberOfColumns}>
            <Tabs
              id={row.id}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
