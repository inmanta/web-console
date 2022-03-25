import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { DateWithTooltip, Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AgentRow } from "@S/Agents/Core/Domain";
import {
  ActionButton,
  StatusLabel,
  KebabDropdown,
  OnResumeToggle,
} from "./Components";

interface Props {
  row: AgentRow;
}

export const AgentsTableRow: React.FC<Props> = ({ row }) => {
  const { routeManager, environmentModifier } = useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();
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
        <Td width={15} dataLabel={words("agents.columns.failover")}>
          {row.last_failover && (
            <DateWithTooltip timestamp={row.last_failover} />
          )}
        </Td>
        <Td width={10} dataLabel={words("agents.columns.unpause")}>
          {row.unpause_on_resume !== null && row.unpause_on_resume !== undefined
            ? JSON.stringify(row.unpause_on_resume)
            : null}
        </Td>
        {isHalted && (
          <Td width={10} dataLabel={words("agents.columns.unpause")}>
            <OnResumeToggle
              name={row.name}
              unpauseOnResume={row.unpause_on_resume}
            />
          </Td>
        )}
        <Td modifier="fitContent">
          <ActionButton name={row.name} paused={row.paused} />
        </Td>
        <Td isActionCell>
          <KebabDropdown name={row.name} paused={row.paused} />
        </Td>
      </Tr>
    </Tbody>
  );
};
