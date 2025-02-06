import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { useGetServiceConfig } from "@/Data/Managers/V2/Service";
import { ErrorView, LoadingView } from "@/UI/Components";
import { ConfigList } from "./ConfigList";

interface Props {
  serviceName: string;
}

export const Config: React.FC<Props> = ({ serviceName }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetServiceConfig(serviceName).useOneTime();

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
