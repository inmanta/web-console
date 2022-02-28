import React, { useRef, useState } from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { ResourceHistoryRow } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { scrollRowIntoView } from "@/UI/Utils";
import { words } from "@/UI/words";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  row: ResourceHistoryRow;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const ResourceHistoryTableRow: React.FC<Props> = ({
  row,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Attributes);
  const rowRef = useRef<HTMLSpanElement>(null);
  const openTabAndScrollTo = (tab: TabKey) => () => {
    setActiveTab(tab);
    if (!isExpanded) {
      onToggle();
    }
    scrollRowIntoView(rowRef);
  };
  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Resource History Table Row">
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("resources.history.column.date")}>
          <DateWithTooltip timestamp={row.date} />
        </Td>
        <Td
          dataLabel={words("resources.column.requires")}
          onClick={openTabAndScrollTo(TabKey.Requires)}
        >
          <span ref={rowRef} style={{ cursor: "pointer" }}>
            {row.numberOfDependencies}
          </span>
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded} data-testid={`details_${row.id}`}>
          <Td colSpan={numberOfColumns}>
            <Tabs
              attributes={row.attributes}
              requires={row.requires}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
