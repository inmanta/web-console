import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import { InstanceLog, Query, RemoteData } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";

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

  const query: Query.SubQuery<"InstanceLogs"> = {
    kind: "InstanceLogs",
    qualifier: {
      environment,
      id: instanceId,
      service_entity,
    },
  };
  dataProvider.useSubscription(query);
  const data = dataProvider.useData<"InstanceLogs">(query);

  return RemoteData.fold<string, InstanceLog[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => <LoadingView delay={500} />,
    failed: (error) => <ErrorView error={error} />,
    success: (logs) =>
      logs.length > 0 ? (
        <div aria-label="ServiceInstanceHistory-Success">
          <pre>
            <code>{JSON.stringify({ logs }, null, 4)}</code>
          </pre>
        </div>
      ) : (
        <div aria-label="ServiceInstanceHistory-Empty">
          <EmptyView message={words("history.missing")(instanceId)} />
        </div>
      ),
  })(data);
};
