import React from "react";
import { Table, Th, Thead, Tr } from "@patternfly/react-table";
import { ServiceModel } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { InstanceStateLabel } from "@/UI/Components";
import { words } from "@/UI/words";
import { InstanceLog } from "@S/ServiceInstanceHistory/Core/Domain";
import { AttributesPresenter } from "@S/ServiceInventory/UI/Presenters";
import { InstanceLogRow } from "./InstanceLogRow";

interface Props {
  service: ServiceModel;
  logs: InstanceLog[];
}

export const HistoryTable: React.FC<Props> = ({ service, logs }) => {
  const columnHeads = [
    words("inventory.statustab.version"),
    words("inventory.column.createdAt"),
    words("inventory.column.state"),
    words("inventory.column.attributesSummary"),
  ];
  const sorted = logs.sort((a, b) => Number(a.version) - Number(b.version));
  const ids = sorted.map((log) => log.version.toString());
  const dict: Record<string, InstanceLog> = {};

  sorted.forEach((log) => (dict[log.version.toString()] = log));
  const attributesPresenter = new AttributesPresenter();

  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "History",
  });

  return (
    <div aria-label="ServiceInstanceHistory-Success">
      <Table>
        <Thead>
          <Tr>
            <Th
              aria-hidden
              screenReaderText={words("common.emptyColumnHeader")}
            />
            {columnHeads.map((head) => (
              <Th key={head}>{head}</Th>
            ))}
          </Tr>
        </Thead>
        {ids.map((id, index) => (
          <InstanceLogRow
            id={id}
            key={id}
            index={index}
            numberOfColumns={columnHeads.length + 1}
            onToggle={onExpansion(id)}
            isExpanded={isExpanded(id)}
            log={dict[id]}
            timestamp={dict[id].timestamp}
            attributesSummary={attributesPresenter.getSummary(
              dict[id].candidate_attributes,
              dict[id].active_attributes,
              dict[id].rollback_attributes,
            )}
            state={<State service={service} state={dict[id].state} />}
          />
        ))}
      </Table>
    </div>
  );
};

const State: React.FC<{ service: ServiceModel; state: string }> = ({
  service,
  state,
}) => {
  // The service entity lifecycle contains all of the states an instance of that entity can reach
  const lifecycleState = service.lifecycle.states.find(
    (serviceState) => serviceState.name === state,
  );

  if (!lifecycleState) {
    return null;
  }

  return InstanceStateLabel({
    name: lifecycleState.name,
    label: lifecycleState.label,
  });
};
