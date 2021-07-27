import { AttributesSummary, DateInfo, InstanceLog } from "@/Core";
import { DateWithTooltip, ExpandableRowProps } from "@/UI/Components";
import { AttributesSummaryView } from "@/UI/Pages/ServiceInventory/Components";
import { scrollRowIntoView } from "@/UI/Utils";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React, { useRef, useState } from "react";
import { Tabs, TabKey } from "./Tabs";

interface Props extends ExpandableRowProps {
  log: InstanceLog;
  timestamp: DateInfo;
  attributesSummary: AttributesSummary;
  state: React.ReactElement;
}

export const InstanceLogRow: React.FC<Props> = ({
  numberOfColumns,
  isExpanded,
  index,
  onToggle,
  id,
  log,
  timestamp,
  attributesSummary,
  state,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.Details);
  const rowRef = useRef<HTMLSpanElement>(null);
  const attributesOnClick = () => {
    if (!isExpanded) {
      onToggle();
    }
    setActiveTab(TabKey.Attributes);
    scrollRowIntoView(rowRef);
  };

  return (
    <Tbody isExpanded={false}>
      <Tr id={`instance-row-${id}`}>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={"version"}>{id}</Td>
        <Td dataLabel={"timestamp"}>
          <DateWithTooltip date={timestamp} />
        </Td>
        <Td dataLabel={"state"}>{state}</Td>
        <Td dataLabel={"Attributes"}>
          <span ref={rowRef} />
          <AttributesSummaryView
            summary={attributesSummary}
            onClick={attributesOnClick}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`details_${id}`}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <Tabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              state={state}
              log={log}
              timestamp={timestamp}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
