import React, { useContext } from "react";
import { RemoteData, ServiceModel } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  serviceName: string;
  Wrapper: React.FC<{ name: string; children?: React.ReactNode }>;
  Dependant: React.FC<{ services: ServiceModel[]; mainService: string }>;
}

export const ServicesProvider: React.FunctionComponent<Props> = ({
  serviceName,
  Wrapper,
  Dependant,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"GetServices">({
    kind: "GetServices",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper aria-label="ServicesProvider-Loading" name={serviceName}>
          <LoadingView />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper aria-label="ServicesProvider-Failed" name={serviceName}>
          <ErrorView message={error} retry={retry} />
        </Wrapper>
      ),
      success: (services) => (
        <Dependant services={services} mainService={serviceName} />
      ),
    },
    data
  );
};
