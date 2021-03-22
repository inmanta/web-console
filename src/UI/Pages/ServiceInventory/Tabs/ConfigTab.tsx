import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { ServicesContext } from "@/UI/ServicesContext";
import React, { useContext } from "react";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigTab: React.FC<Props> = ({ serviceInstanceIdentifier }) => {
  const { dataProvider } = useContext(ServicesContext);

  const [data] = dataProvider.useOnce({
    kind: "InstanceConfig",
    qualifier: serviceInstanceIdentifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} />,
      success: (data) => (
        <div>
          <pre>
            <code>{JSON.stringify(data, null, 4)}</code>
          </pre>
        </div>
      ),
    },
    data
  );
};
