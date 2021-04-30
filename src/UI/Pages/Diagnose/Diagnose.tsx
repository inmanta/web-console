import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData, ServiceModel } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  service: ServiceModel;
  instanceId: string;
  environment: string;
}

export const Diagnose: React.FC<Props> = ({
  service,
  instanceId,
  environment,
}) => {
  const { dataProvider } = useContext(DependencyContext);

  const [data] = dataProvider.useContinuous<"Diagnostics">({
    kind: "Diagnostics",
    qualifier: {
      environment,
      id: instanceId,
      service_entity: service.name,
    },
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView delay={500} />,
      failed: (error) => <ErrorView message={error} />,
      success: (diagnostics) => {
        if (
          diagnostics.failures.length <= 0 &&
          diagnostics.rejections.length === 0
        ) {
          return (
            <div aria-label="Diagnostics-Empty">
              <EmptyView message={words("diagnose.empty")(instanceId)} />
            </div>
          );
        }

        return <div aria-label="Diagnostics-Success"></div>;
      },
    },
    data
  );
};
