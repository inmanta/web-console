import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData, ServiceModel } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { HistoryTable } from "./HistoryTable";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const ServiceInstanceHistory: React.FC<Props> = ({
  service,
  instanceId,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetInstanceLogs">({
    kind: "GetInstanceLogs",
    id: instanceId,
    service_entity: service.name,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView delay={500} />,
      failed: (error) => <ErrorView message={error} />,
      success: (logs) =>
        logs.length <= 0 ? (
          <div aria-label="ServiceInstanceHistory-Empty">
            <EmptyView message={words("history.missing")(instanceId)} />
          </div>
        ) : (
          <HistoryTable service={service} logs={logs} />
        ),
    },
    data
  );
};
