import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Card, CardBody } from "@patternfly/react-core";
import React, { useContext } from "react";
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

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} retry={retry} />,
      success: ({ config, defaults }) => (
        <ConfigDetails
          config={config}
          defaults={defaults}
          serviceInstanceIdentifier={serviceInstanceIdentifier}
        />
      ),
    },
    data
  );
};
