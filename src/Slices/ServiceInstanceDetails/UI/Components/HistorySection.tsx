import React, { useContext } from "react";
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Panel,
} from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { DateWithTooltip } from "@/UI/Components";
import { InstanceContext } from "../../Core/Context";

export const HistorySection: React.FunctionComponent = () => {
  const { instance, logsQuery } = useContext(InstanceContext);

  const [selectedVersion, setSelectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  const onSelectDataListItem = (
    _event: React.MouseEvent | React.KeyboardEvent,
    id: string,
  ) => {
    setSelectedVersion(id);
  };

  return (
    <Panel variant="raised">
      <DataList
        selectedDataListItemId={selectedVersion}
        onSelectDataListItem={onSelectDataListItem}
        aria-label="VersionHistory"
        wrapModifier="nowrap"
      >
        {logsQuery.data &&
          logsQuery.data.map((log: InstanceLog) => (
            <HistoryRow key={String(log.version)} log={log} />
          ))}
      </DataList>
    </Panel>
  );
};

interface HistoryRowProps {
  log: InstanceLog;
}

const HistoryRow: React.FunctionComponent<HistoryRowProps> = ({ log }) => {
  return (
    <DataListItem
      aria-labelledby={`${String(log.version)}`}
      id={`${String(log.version)}`}
    >
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="version">
              <span>Version {String(log.version)}</span>
            </DataListCell>,
            <DataListCell key="date">
              <DateWithTooltip timestamp={log.created_at} />
            </DataListCell>,
            <DataListCell key="state">{log.state}</DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};

// const State: React.FC<{ service: ServiceModel; state: string }> = ({
//   service,
//   state,
// }) => {
//   // The service entity lifecycle contains all of the states an instance of that entity can reach
//   const lifecycleState = service.lifecycle.states.find(
//     (serviceState) => serviceState.name === state,
//   );
//   if (!lifecycleState) {
//     return null;
//   }

//   return InstanceState({
//     name: lifecycleState.name,
//     label: lifecycleState.label,
//   });
// };
