import { AttributesSummary, DateInfo, InstanceLog } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { ExpandableRowProps } from "@/UI/Components/ExpandableTable";
import { AttributesSummaryView } from "@/UI/ServiceInventory/Components";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React, { useState } from "react";

interface Props extends ExpandableRowProps {
  log: InstanceLog;
  timestamp: DateInfo;
  attributesSummary: AttributesSummary;
}

type TabKey = "Details" | "Attributes" | "Events";

export const InstanceLogRow: React.FC<Props> = ({
  numberOfColumns,
  isExpanded,
  index,
  onToggle,
  id,
  log,
  timestamp,
  attributesSummary,
}) => {
  const [, setActiveTab] = useState<TabKey>("Details");
  const attributesOnClick = () => {
    if (!isExpanded) {
      onToggle();
    }
    setActiveTab("Attributes");
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
        <Td dataLabel={"state"}>{log.state}</Td>
        <Td dataLabel={"Attributes"}>
          <a href={`#instance-row-${id}`}>
            <AttributesSummaryView
              summary={attributesSummary}
              onClick={attributesOnClick}
            />
          </a>
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded} data-testid={`details_${id}`}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>expanded</ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};
