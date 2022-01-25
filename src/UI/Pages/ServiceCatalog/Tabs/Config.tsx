import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { RemoteDataView } from "@/UI/Components";
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
        <RemoteDataView
          data={data}
          retry={retry}
          SuccessView={(config) => (
            <ConfigList config={config} serviceName={serviceName} />
          )}
        />
      </CardBody>
    </Card>
  );
};
