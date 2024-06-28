import React, { useContext } from "react";
import {
  Divider,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { ServiceModel } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import {
  DateWithTooltip,
  ErrorView,
  InstanceState,
  LoadingView,
} from "@/UI/Components";
import { InstanceContext } from "../../Core/Context";

export const HistorySection: React.FunctionComponent = () => {
  const { instance, logsQuery } = useContext(InstanceContext);

  const [selectedVersion, setSelectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  return (
    <Panel variant="raised" isScrollable>
      <PanelHeader>
        <Title headingLevel="h2">Version History</Title>
      </PanelHeader>
      <Divider />
      <PanelMain>
        <PanelMainBody>
          {logsQuery.isLoading && <LoadingView ariaLabel="History-Loading" />}
          {logsQuery.isError && (
            <ErrorView
              message={"Error loading Version History"}
              ariaLabel="History-Error"
            />
          )}
          {logsQuery.data && !logsQuery.isLoading && !logsQuery.isError && (
            <Table aria-label="VersionHistoryTable" isStickyHeader>
              <Thead>
                <Tr>
                  <Th width={25}>Version</Th>
                  <Th width={35}>Date</Th>
                  <Th width={40}>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logsQuery.data.map((log: InstanceLog) => (
                  <Tr
                    key={String(log.version)}
                    isSelectable
                    isClickable
                    onRowClick={() => setSelectedVersion(String(log.version))}
                    isRowSelected={String(log.version) === selectedVersion}
                  >
                    <HistoryRowContent log={log} />
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

interface HistoryRowProps {
  log: InstanceLog;
}

const HistoryRowContent: React.FunctionComponent<HistoryRowProps> = ({
  log,
}) => {
  const { serviceModelQuery } = useContext(InstanceContext);

  return (
    <>
      <Td dataLabel="version">{String(log.version)}</Td>
      <Td dataLabel="date">
        <DateWithTooltip timestamp={log.created_at} />
      </Td>
      <Td dataLabel="state">
        <State state={log.state} service={serviceModelQuery.data} />
      </Td>
    </>
  );
};

const State: React.FC<{ service: ServiceModel | undefined; state: string }> = ({
  service,
  state,
}) => {
  if (!service) {
    return state;
  }

  // The service entity lifecycle contains all of the states an instance of that entity can reach
  const lifecycleState = service.lifecycle.states.find(
    (serviceState) => serviceState.name === state,
  );
  if (!lifecycleState) {
    return null;
  }

  return InstanceState({
    name: lifecycleState.name,
    label: lifecycleState.label,
  });
};
