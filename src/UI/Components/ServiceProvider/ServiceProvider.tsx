import React, { useContext } from "react";
import { ServicesContext } from "@/UI/ServicesContext";
import { Query, RemoteData, ServiceModel } from "@/Core";
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
  const { dataProvider } = useContext(ServicesContext);

  const [data, retry] = dataProvider.useContinuous<"Service">({
    kind: "Service",
    qualifier: { name: serviceName, environment: environmentId },
  });

  return RemoteData.fold<
    Query.Error<"Service">,
    Query.Data<"Service">,
    JSX.Element | null
  >({
    notAsked: () => null,
    loading: () => (
      <Wrapper aria-label="ServiceProvider-Loading">
        <LoadingView delay={500} />
      </Wrapper>
    ),
    failed: (error) => (
      <Wrapper aria-label="ServiceProvider-Failed">
        <ErrorView message={error} retry={retry} />
      </Wrapper>
    ),
    success: (service) => <Dependant service={service} />,
  })(data);
};
