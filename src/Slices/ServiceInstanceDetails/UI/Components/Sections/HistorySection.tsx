import React, { useContext } from "react";
import {
  Button,
  Divider,
  Flex,
  FlexItem,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { useUrlStateWithString } from "@/Data";
import { DependencyContext, words } from "@/UI";
import {
  DateWithTooltip,
  ErrorView,
  InstanceStateLabel,
  Link,
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
  const { routeManager } = useContext(DependencyContext);
  const [selectedVersion, setSelectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: `version`,
    route: "InstanceDetails",
  });

  return (
    <Panel variant="raised" isScrollable>
      <PanelHeader>
        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
          <FlexItem>
            <Title headingLevel="h2">
              {words("instanceDetails.history.title")}
            </Title>
          </FlexItem>
          <FlexItem>
            <Link
              pathname={routeManager.getUrl("Diagnose", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={instance.deleted}
            >
              <Button variant="secondary">
                {words("instanceDetails.history.diagnose")}
              </Button>
            </Link>
          </FlexItem>
        </Flex>
      </PanelHeader>
      <Divider />
      <PanelMain>
        <PanelMainBody>
          {logsQuery.isLoading && <LoadingView ariaLabel="History-Loading" />}
          {(logsQuery.isError ||
            logsQuery.isFetchNextPageError ||
            logsQuery.isFetchPreviousPageError) && (
            <ErrorView
              message={words("instanceDetails.history.error")}
              ariaLabel="History-Error"
            />
          )}
          {logsQuery.isSuccess && (
            <Table aria-label="VersionHistoryTable">
              <Tbody>
                {logsQuery.hasPreviousPage && (
                  <Tr isBorderRow>
                    <Td colSpan={3}>
                      <Flex
                        justifyContent={{ default: "justifyContentCenter" }}
                      >
                        <Button
                          variant="tertiary"
                          size="sm"
                          isLoading={logsQuery.isFetchingPreviousPage}
                          onClick={() => logsQuery.fetchPreviousPage()}
                        >
                          {words("load.latest")}
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                )}
                {logsQuery.data.map((log: InstanceLog) => (
                  <Tr
                    key={String(log.version)}
                    isSelectable
                    isClickable
                    onRowClick={() => setSelectedVersion(String(log.version))}
                    isRowSelected={String(log.version) === selectedVersion}
                    aria-label="History-Row"
                    className={log.deleted ? "danger" : ""}
                  >
                    <HistoryRowContent log={log} />
                  </Tr>
                ))}
                {logsQuery.hasNextPage && (
                  <Tr>
                    <Td colSpan={3}>
                      <Flex
                        justifyContent={{ default: "justifyContentCenter" }}
                      >
                        <Button
                          variant="tertiary"
                          size="sm"
                          isLoading={logsQuery.isFetchingNextPage}
                          onClick={() => logsQuery.fetchNextPage()}
                        >
                          {words("load.previous")}
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                )}
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
export const StateLabel: React.FC<StateLabelProps> = ({ service, state }) => {
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
