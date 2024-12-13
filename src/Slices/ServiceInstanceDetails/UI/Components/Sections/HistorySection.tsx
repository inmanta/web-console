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
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { words } from "@/UI";
import {
  DateWithTooltip,
  ErrorView,
  InstanceStateLabel,
  LoadingView,
} from "@/UI/Components";
import { InstanceDetailsContext } from "../../../Core/Context";

/**
 * The HistorySection Component
 *
 * Displays a table containing all the past, and current version of the instance.
 * Clicking on a row will set the selected version in the url.
 *
 * To be added: A diagnose button that allows the user to perform a diagnose that goes back x-amount of versions.
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @returns {React.FC} A React Component displaying the HistorySection
 */
export const HistorySection: React.FC = () => {
  const { instance, logsQuery } = useContext(InstanceDetailsContext);

  const [selectedVersion, setSelectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  return (
    <Panel variant="raised" isScrollable>
      <PanelHeader>
        <Title headingLevel="h2">
          {words("instanceDetails.history.title")}
        </Title>
      </PanelHeader>
      <Divider />
      <PanelMain>
        <PanelMainBody>
          {logsQuery.isLoading && <LoadingView ariaLabel="History-Loading" />}
          {logsQuery.isError && (
            <ErrorView
              message={words("instanceDetails.history.error")}
              ariaLabel="History-Error"
            />
          )}
          {/**Because of the caching of React queries,
           * there's an additional check to make sure the table shows the data only
           * when the section is not in error state or loading.
           * Otherwise, it will still display the stale data under the error messages above.
           */}
          {logsQuery.data && !logsQuery.isLoading && !logsQuery.isError && (
            <Table aria-label="VersionHistoryTable" isStickyHeader>
              <Thead>
                <Tr>
                  <Th style={{ minWidth: "100px" }}>
                    {words("instanceDetails.history.table.version")}
                  </Th>
                  <Th style={{ minWidth: "100px" }}>
                    {words("instanceDetails.history.table.timestamp")}
                  </Th>
                  <Th>{words("instanceDetails.history.table.status")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logsQuery.data.map((log: InstanceLog) => (
                  <StyledRow
                    key={String(log.version)}
                    isSelectable
                    isClickable
                    onRowClick={() => setSelectedVersion(String(log.version))}
                    isRowSelected={String(log.version) === selectedVersion}
                    aria-label="History-Row"
                    className={log.deleted ? "-terminated" : ""}
                  >
                    <HistoryRowContent log={log} />
                  </StyledRow>
                ))}
              </Tbody>
            </Table>
          )}
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

const StyledRow = styled(Tr)`
  &.-terminated {
    &:hover {
      background-color: var(--pf-t--global--color--nonstatus--red--clicked);
    }
    &.pf-m-clickable {
      background-color: var(--pf-t--global--color--nonstatus--red--default);
    }
    &.pf-m-selected {
      background-color: var(--pf-t--global--color--nonstatus--red--clicked);
    }
  }
`;

interface HistoryRowProps {
  log: InstanceLog;
}

/**
 * The HistoryRowContent Component
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @Props {HistoryRowProps} - The props of the component
 *  @prop {InstanceLog} log - The instance log containing the history details.
 * @returns {React.FC<HistoryRowProps>} A React Component that displays the row content for each individual version.
 */
const HistoryRowContent: React.FC<HistoryRowProps> = ({ log }) => {
  const { serviceModelQuery } = useContext(InstanceDetailsContext);

  return (
    <>
      <Td dataLabel="version">{String(log.version)}</Td>
      <Td
        dataLabel="timestamp"
        data-testid={`version-${log.version}-timestamp`}
      >
        <DateWithTooltip isFull timestamp={log.timestamp} />
      </Td>
      <Td dataLabel="state" data-testid={`version-${log.version}-state`}>
        <StateLabel state={log.state} service={serviceModelQuery.data} />
      </Td>
    </>
  );
};

interface StateLabelProps {
  service: ServiceModel | undefined;
  state: string;
}

/**
 * The StateLabel Component
 *
 * @Props {Props} - The props of the component.
 *  @prop {ServiceModel | undefined} service - the service model containing the different available states
 *  @prop {string} state - the state that needs to be be matched against the available states in the model
 * @returns {React.FC<StateLabelProps>} A React Component displaying a label tag for the state with the right color
 */
const StateLabel: React.FC<StateLabelProps> = ({ service, state }) => {
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

  return InstanceStateLabel({
    name: lifecycleState.name,
    label: lifecycleState.label,
  });
};
