import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import { Query, RemoteData } from "@/Core";
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
