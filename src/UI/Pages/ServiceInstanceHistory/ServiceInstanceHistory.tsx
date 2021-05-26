import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { InstanceLog, RemoteData, ServiceModel } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ExpandableTable,
  InstanceState,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { InstanceLogRow } from "./InstanceLogRow";
import {
  AttributesPresenter,
  MomentDatePresenter,
} from "@/UI/Pages/ServiceInventory/Presenters";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const ServiceInstanceHistory: React.FC<Props> = ({
  service,
  instanceId,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"InstanceLogs">({
    kind: "InstanceLogs",
    id: instanceId,
    service_entity: service.name,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView delay={500} />,
      failed: (error) => <ErrorView message={error} />,
      success: (logs) => {
        if (logs.length <= 0) {
          return (
            <div aria-label="ServiceInstanceHistory-Empty">
              <EmptyView message={words("history.missing")(instanceId)} />
            </div>
          );
        }

        const columnHeads = ["Version", "Timestamp", "State", "Attributes"];
        const sorted = logs.sort((a, b) => a.version - b.version);
        const ids = sorted.map((log) => log.version.toString());
        const dict: Record<string, InstanceLog> = {};
        sorted.forEach((log) => (dict[log.version.toString()] = log));
        const datePresenter = new MomentDatePresenter();
        const attributesPresenter = new AttributesPresenter();

        return (
          <div aria-label="ServiceInstanceHistory-Success">
            <ExpandableTable
              columnHeads={columnHeads}
              ids={ids}
              Row={(props) => (
                <InstanceLogRow
                  {...props}
                  log={dict[props.id]}
                  timestamp={datePresenter.get(dict[props.id].timestamp)}
                  attributesSummary={attributesPresenter.getSummary(
                    dict[props.id].candidate_attributes,
                    dict[props.id].active_attributes,
                    dict[props.id].rollback_attributes
                  )}
                  state={
                    <State service={service} state={dict[props.id].state} />
                  }
                />
              )}
            />
          </div>
        );
      },
    },
    data
  );
};

const State: React.FC<{ service: ServiceModel; state: string }> = ({
  service,
  state,
}) => {
  // The service entity lifecycle contains all of the states an instance of that entity can reach
  const lifecycleState = service.lifecycle.states.find(
    (serviceState) => serviceState.name === state
  );
  if (!lifecycleState) {
    return null;
  }

  return InstanceState({
    name: lifecycleState.name,
    label: lifecycleState.label,
  });
};
