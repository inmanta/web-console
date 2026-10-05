import React from "react";
import { ServiceModel } from "@/Core";
import { useGetServiceModel } from "@/Data/Queries";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";

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
  const { data, isError, error, refetch } = useGetServiceModel(serviceName).useContinuous();

  if (data) {
    return <Dependant service={data} />;
  }

  if (isError) {
    return (
      <Wrapper aria-label="ServiceProvider-Failed" name={serviceName}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="ServiceProvider-Failed" />
      </Wrapper>
    );
  }

  return (
    <Wrapper aria-label="ServiceProvider-Loading" name={serviceName}>
      <LoadingView ariaLabel="ServiceProvider-Loading" />
    </Wrapper>
  );
};
