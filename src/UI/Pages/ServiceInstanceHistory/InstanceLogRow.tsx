import { DateInfo, InstanceLog } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { ExpandableRowProps } from "@/UI/Components/ExpandableTable";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import React from "react";

interface Props extends ExpandableRowProps {
  log: InstanceLog;
  timestamp: DateInfo;
}

export const InstanceLogRow: React.FC<Props> = ({
  numberOfColumns,
  isExpanded,
  index,
  onToggle,
  id,
  log,
  timestamp,
}) => (
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
      <Td dataLabel={"Attributes"}>{log.service_instance_id}</Td>
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${id}`}>
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>expanded</ExpandableRowContent>
      </Td>
    </Tr>
  </Tbody>
);
