import React, { useContext } from "react";
import { RemoteData, ServiceModel } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  serviceName: string;
  Wrapper: React.FC<{ name: string; children?: React.ReactNode }>;
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
        <Wrapper aria-label="ServiceProvider-Loading" name={serviceName}>
          <LoadingView />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServiceProvider-Failed" name={serviceName}>
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: (service) => <Dependant service={service} />,
    },
    data,
  );
};
