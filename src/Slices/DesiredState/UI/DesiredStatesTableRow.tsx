import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { DateWithTooltip } from "@/UI/Components";
import { words } from "@/UI/words";
import {
  DesiredStateVersion,
  DesiredStateVersionStatus,
} from "@S/DesiredState/Core/Domain";
import { Actions, ResourcesLink, StatusLabel } from "./Components";

interface Props {
  row: DesiredStateVersion;
}

export const DesiredStatesTableRow: React.FC<Props> = ({ row }) => (
  <Tbody isExpanded={false}>
    <Tr aria-label="DesiredStates Table Row">
      <Td dataLabel={words("desiredState.columns.date")} width={20}>
        <DateWithTooltip timestamp={row.date} />
      </Td>
      <Td dataLabel={words("desiredState.columns.version")} width={20}>
        {row.version}
      </Td>
      <Td dataLabel={words("desiredState.columns.status")} width={20}>
        <StatusLabel status={row.status} />
      </Td>
      <Td dataLabel={words("desiredState.columns.resources")} width={20}>
        {row.total}
      </Td>
      <Td dataLabel={words("desiredState.columns.labels")} width={20}>
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
      </Td>
      <Td>
        <ResourcesLink version={row.version} />
      </Td>
      <Td>
        <Actions
          version={row.version}
          isPromoteDisabled={row.status != DesiredStateVersionStatus.candidate}
        />
      </Td>
    </Tr>
  </Tbody>
);
