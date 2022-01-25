import React, { useContext } from "react";
import { RemoteData, ServiceModel } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  serviceName: string;
  Wrapper: React.FC;
  Dependant: React.FC<{ service: ServiceModel }>;
}

export const ServiceProvider: React.FunctionComponent<Props> = ({
  serviceName,
  Wrapper,
  Dependant,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"GetService">({
    kind: "GetService",
    name: serviceName,
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
