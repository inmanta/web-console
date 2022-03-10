import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { AgentRow } from "@/Core";
import { DateWithTooltip, Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Actions } from "./Actions";
import { StatusLabel } from "./Components";

interface Props {
  row: AgentRow;
}

export const AgentsTableRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Agents Table Row">
        <Td dataLabel={words("agents.columns.name")}>{row.name}</Td>
        <Td dataLabel={words("agents.columns.process")}>
          {row.process_id && (
            <Link
              pathname={routeManager.getUrl("AgentProcess", {
                id: row.process_id,
              })}
            >
              <Button variant="link">{row.process_name}</Button>
            </Link>
          )}
        </Td>
        <Td width={10} dataLabel={words("agents.columns.status")}>
          <StatusLabel status={row.status} />
        </Td>
        <Td width={10} dataLabel={words("agents.columns.failover")}>
          {row.last_failover && (
            <DateWithTooltip timestamp={row.last_failover} />
          )}
        </Td>
        <Td width={10} dataLabel={words("agents.columns.unpause")}>
          {row.unpause_on_resume !== null && row.unpause_on_resume !== undefined
            ? JSON.stringify(row.unpause_on_resume)
            : null}
        </Td>
        <Td isActionCell modifier="fitContent">
          <Actions name={row.name} paused={row.paused} />
        </Td>
      </Tr>
    </Tbody>
  );
};
