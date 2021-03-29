import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import React, { useContext } from "react";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigTab: React.FC<Props> = ({ serviceInstanceIdentifier }) => {
  const { commandProvider, dataProvider } = useContext(DependencyContext);
  const [data, retry] = dataProvider.useOneTime<"InstanceConfig">({
    kind: "InstanceConfig",
    qualifier: serviceInstanceIdentifier,
  });
  const trigger = commandProvider.getTrigger<"InstanceConfig">({
    kind: "InstanceConfig",
    qualifier: serviceInstanceIdentifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} retry={retry} />,
      success: (data) => (
        <div>
          <button onClick={() => trigger("auto_designed", true)}>
            trigger
          </button>
          <pre>
            <code>{JSON.stringify(data, null, 4)}</code>
          </pre>
        </div>
      ),
    },
    data
  );
};
