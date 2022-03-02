import React, { useContext } from "react";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ConfigDetails } from "./ConfigDetails";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigTab: React.FC<Props> = ({ serviceInstanceIdentifier }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"GetInstanceConfig">({
    kind: "GetInstanceConfig",
    ...serviceInstanceIdentifier,
  });

  return (
    <RemoteDataView
      data={data}
      retry={retry}
      SuccessView={({ config, defaults }) => (
        <ConfigDetails
          config={config}
          defaults={defaults}
          serviceInstanceIdentifier={serviceInstanceIdentifier}
        />
      )}
    />
  );
};
