import React, { useContext } from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AgentRow } from "@S/Agents/Core/Domain";
import {
  ActionButton,
  AgentStatusLabel,
  KebabDropdown,
  OnResumeToggle,
} from "./Components";

interface Props {
  row: AgentRow;
}

export const AgentsTableRow: React.FC<Props> = ({ row }) => {
  const { environmentModifier } = useContext(DependencyContext);
  const isHalted = environmentModifier.useIsHalted();

  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Agents Table Row">
        <Td dataLabel={words("agents.columns.name")}>{row.name}</Td>
        <Td dataLabel={words("agents.columns.status")}>
          <AgentStatusLabel status={row.status} />
        </Td>
        {isHalted && (
          <Td dataLabel={words("agents.columns.unpause")}>
            <OnResumeToggle
              name={row.name}
              unpauseOnResume={row.unpause_on_resume}
            />
          </Td>
        )}
        <Td modifier="fitContent" isActionCell>
          <ActionButton name={row.name} paused={row.paused} />
        </Td>
        <Td isActionCell>
          <KebabDropdown name={row.name} paused={row.paused} />
        </Td>
      </Tr>
    </Tbody>
  );
};
