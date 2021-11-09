import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ConfigList } from "./ConfigList";

interface Props {
  serviceName: string;
}

export const Config: React.FC<Props> = ({ serviceName }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"GetServiceConfig">({
    kind: "GetServiceConfig",
    name: serviceName,
  });

  return (
    <Card aria-label="ServiceConfig">
      <CardBody>
        {RemoteData.fold(
          {
            notAsked: () => null,
            loading: () => <LoadingView />,
            failed: (error) => <ErrorView message={error} retry={retry} />,
            success: (config) => (
              <ConfigList config={config} serviceName={serviceName} />
            ),
          },
          data
        )}
      </CardBody>
    </Card>
  );
};
