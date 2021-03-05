import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import { InstanceLog, Query, RemoteData } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ExpandableTable,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { InstanceLogRow } from "./InstanceLogRow";
import {
  AttributesPresenter,
  MomentDatePresenter,
} from "@/UI/ServiceInventory/Presenters";

interface Props {
  service_entity: string;
  instanceId: string;
  environment: string;
}

export const ServiceInstanceHistory: React.FC<Props> = ({
  service_entity,
  instanceId,
  environment,
}) => {
  const { dataProvider } = useContext(ServicesContext);

  const [data] = dataProvider.useOnce<"InstanceLogs">({
    kind: "InstanceLogs",
    qualifier: {
      environment,
      id: instanceId,
      service_entity,
    },
  });

  return RemoteData.fold<
    Query.Error<"InstanceLogs">,
    Query.Data<"InstanceLogs">,
    JSX.Element | null
  >({
    notAsked: () => null,
    loading: () => <LoadingView delay={500} />,
    failed: (error) => <ErrorView error={error} />,
    success: (logs) => {
      if (logs.length <= 0) {
        return (
          <div aria-label="ServiceInstanceHistory-Empty">
            <EmptyView message={words("history.missing")(instanceId)} />
          </div>
        );
      }

      const columnHeads = ["Version", "Timestamp", "State", "Attributes"];
      const ids = logs.map((log) => log.version.toString());
      const dict: Record<string, InstanceLog> = {};
      logs.forEach((log) => (dict[log.version.toString()] = log));
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
              />
            )}
          />
        </div>
      );
    },
  })(data);
};
