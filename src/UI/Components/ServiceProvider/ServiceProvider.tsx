import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetServiceModel } from "@/Data/Managers/V2/GETTERS/GetServiceModel";
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
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { data, isError, error, isSuccess, refetch } = useGetServiceModel(
    serviceName,
    env,
  ).useContinuous();

  if (isError) {
    <Wrapper aria-label="ServiceProvider-Failed" name={serviceName}>
      <ErrorView
        message={error.message}
        retry={refetch}
        ariaLabel="ServiceProvider-Failed"
      />
    </Wrapper>;
  }
  if (isSuccess) {
    return <Dependant service={data} />;
  }

  return (
    <Wrapper aria-label="ServiceProvider-Loading" name={serviceName}>
      <LoadingView ariaLabel="ServiceProvider-Loading" />
    </Wrapper>
  );
};
