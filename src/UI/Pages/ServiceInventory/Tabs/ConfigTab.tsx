import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { EmptyView, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfigDetails } from "./ConfigDetails";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const DisabledConfigTab: React.FC = () => (
  <Card>
    <CardBody>
      <EmptyView message={words("config.disabled")} />
    </CardBody>
  </Card>
);

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
