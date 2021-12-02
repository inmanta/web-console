import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { AgentRow } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { words } from "@/UI/words";
import { Actions } from "./Actions";

interface Props {
  row: AgentRow;
}

export const AgentsTableRow: React.FC<Props> = ({ row }) => (
  <Tbody isExpanded={false}>
    <Tr aria-label="Agents Table Row">
      <Td dataLabel={words("agents.columns.name")}>{row.name}</Td>
      <Td dataLabel={words("agents.columns.process")}>{row.process_name}</Td>
      <Td dataLabel={words("agents.columns.status")}>{row.status}</Td>
      <Td dataLabel={words("agents.columns.failover")}>
        {row.last_failover && <DateWithTooltip timestamp={row.last_failover} />}
      </Td>
      <Td dataLabel={words("agents.columns.unpause")}>
        {row.unpause_on_resume !== null && row.unpause_on_resume !== undefined
          ? JSON.stringify(row.unpause_on_resume)
          : null}
      </Td>
      <Td dataLabel={words("agents.columns.actions")}>
        <Actions name={row.name} paused={row.paused} />
      </Td>
    </Tr>
  </Tbody>
);
