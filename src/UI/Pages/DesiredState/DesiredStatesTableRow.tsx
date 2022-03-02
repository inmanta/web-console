import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { DesiredStateVersion } from "@/Core";
import { DesiredStateVersionStatus } from "@/Core/Domain/DesiredStateVersionStatus";
import { DateWithTooltip } from "@/UI/Components";
import { words } from "@/UI/words";
import { Actions, ResourcesLink } from "./Components";

interface Props {
  row: DesiredStateVersion;
}

export const DesiredStatesTableRow: React.FC<Props> = ({ row }) => (
  <StyledBody isExpanded={false} $status={row.status}>
    <Tr aria-label="DesiredStates Table Row">
      <StyledCell
        dataLabel={words("desiredState.columns.date")}
        $status={row.status}
        width={20}
      >
        <DateWithTooltip timestamp={row.date} />
      </StyledCell>
      <StyledCell
        dataLabel={words("desiredState.columns.version")}
        $status={row.status}
        width={20}
      >
        {row.version}
      </StyledCell>
      <StyledCell
        dataLabel={words("desiredState.columns.status")}
        $status={row.status}
        width={20}
      >
        {row.status}
      </StyledCell>
      <StyledCell
        dataLabel={words("desiredState.columns.resources")}
        $status={row.status}
        width={20}
      >
        {row.total}
      </StyledCell>
      <StyledCell
        dataLabel={words("desiredState.columns.labels")}
        $status={row.status}
        width={20}
      >
        {row.labels && row.labels.length > 0
          ? row.labels.map(({ name, message }, idx) => (
              <Tooltip
                entryDelay={200}
                content={message}
                key={`${idx}-${name}`}
              >
                <span>{name}</span>
              </Tooltip>
            ))
          : null}
      </StyledCell>
      <StyledCell $status={row.status}>
        <ResourcesLink version={row.version} />
      </StyledCell>
      <StyledCell $status={row.status}>
        <Actions
          version={row.version}
          isPromoteDisabled={row.status != DesiredStateVersionStatus.candidate}
        />
      </StyledCell>
    </Tr>
  </StyledBody>
);

const StyledBody = styled(Tbody)<{ $status: DesiredStateVersionStatus }>`
  ${({ $status }) => {
    switch ($status) {
      case DesiredStateVersionStatus.active:
        return "background-color: var(--pf-global--palette--green-100);";
      case DesiredStateVersionStatus.retired:
        return "background-color: var(--pf-global--palette--black-200);";
      case DesiredStateVersionStatus.skipped_candidate:
        return "background-color: var(--pf-global--palette--black-150);";
      default:
        return "";
    }
  }};
`;

const StyledCell = styled(Td)<{ $status: DesiredStateVersionStatus }>`
  ${({ $status }) =>
    $status == DesiredStateVersionStatus.skipped_candidate
      ? "&& { color: var(--pf-global--palette--black-600); }"
      : ""};
`;
