import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import { InstanceLog, Query, RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";

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
  const data = dataProvider.useData<"InstanceLogs">(query);

  return RemoteData.fold<string, InstanceLog[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => <LoadingView delay={500} />,
    failed: (error) => <ErrorView error={error} />,
    success: (logs) => (
      <div aria-label="ServiceInstanceHistory">
        <pre>
          <code>{JSON.stringify({ logs }, null, 4)}</code>
        </pre>
      </div>
    ),
  })(data);
};
