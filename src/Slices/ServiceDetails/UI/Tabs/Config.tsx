import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ConfigList } from "./ConfigList";
import { useGetServiceConfig } from "@/Data/Managers/V2/GETTERS/GetServiceConfig/useGetServiceConfig";

interface Props {
  serviceName: string;
}

export const Config: React.FC<Props> = ({ serviceName }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { data, isSuccess, isError, error, refetch } = useGetServiceConfig(
    serviceName,
    env,
  ).useOneTime();

  if (isError) {
    <Card aria-label="ServiceConfig-Failed" data-testid="ServiceConfig">
      <CardBody>
        <ErrorView
          message={error.message}
          retry={refetch}
          ariaLabel="ServiceConfig-Error"
        />
      </CardBody>
    </Card>;
  }

  if (isSuccess) {
    return (
      <Card aria-label="ServiceConfig-Success" data-testid="ServiceConfig">
        <CardBody>
          <ConfigList config={data} serviceName={serviceName} />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card aria-label="ServiceConfig-Loading" data-testid="ServiceConfig">
      <CardBody>
        <LoadingView />
      </CardBody>
    </Card>
  );
};
