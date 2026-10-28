import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import {
  DesiredStateVersion,
  DesiredStateVersionStatus,
} from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { DateWithTooltip } from "@inmanta/web-console-ui/Components/DateWithTooltip";
import { DesiredStateStatusLabel } from "@inmanta/web-console-ui/Components/DesiredStateStatusLabel";
import { Actions, ResourcesLink } from "./Components";

interface Props {
  row: DesiredStateVersion;
}

export const DesiredStatesTableRow: React.FC<Props> = ({ row }) => (
  <Tbody isExpanded={false}>
    <Tr aria-label="DesiredStates Table Row">
      <Td dataLabel={words("date")} width={20}>
        <DateWithTooltip timestamp={row.date} />
      </Td>
      <Td dataLabel={words("version")} width={20}>
        {row.version as React.ReactNode}
      </Td>
      <Td dataLabel={words("status")} width={20}>
        <DesiredStateStatusLabel status={row.status} />
      </Td>
      <Td dataLabel={words("desiredState.columns.resources")} width={20}>
        {row.total as React.ReactNode}
      </Td>
      <Td dataLabel={words("desiredState.columns.labels")} width={20}>
        {row.labels && row.labels.length > 0
          ? row.labels.map(({ name, message }, idx) => (
              <Tooltip entryDelay={200} content={message} key={`${idx}-${name}`}>
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
