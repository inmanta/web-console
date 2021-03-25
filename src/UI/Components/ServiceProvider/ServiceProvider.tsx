import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { RemoteData, ServiceModel } from "@/Core";
import { LoadingView } from "@/UI/Components/LoadingView";
import { ErrorView } from "@/UI/Components/ErrorView";

interface Props {
  serviceName: string;
  environmentId: string;
  Wrapper: React.FC;
  Dependant: React.FC<{ service: ServiceModel }>;
}

export const ServiceProvider: React.FunctionComponent<Props> = ({
  serviceName,
  environmentId,
  Wrapper,
  Dependant,
}) => {
  const { dataProvider } = useContext(DependencyContext);

  const [data, retry] = dataProvider.useContinuous<"Service">({
    kind: "Service",
    qualifier: { name: serviceName, environment: environmentId },
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper aria-label="ServiceProvider-Loading">
          <LoadingView />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServiceProvider-Failed">
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: (service) => <Dependant service={service} />,
    },
    data
  );
};
