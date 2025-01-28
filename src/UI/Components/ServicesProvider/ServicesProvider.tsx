import React from "react";
import { ServiceModel } from "@/Core";
import { useGetServiceModels } from "@/Data/Managers/V2/GETTERS/GetServiceModels";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";

interface Props {
  serviceName: string;
  Wrapper: React.FC<{ name: string; children?: React.ReactNode }>;
  Dependant: React.FC<{ services: ServiceModel[]; mainServiceName: string }>;
}

export const ServicesProvider: React.FunctionComponent<Props> = ({
  serviceName,
  Wrapper,
  Dependant,
}) => {
  const { data, isError, error, isSuccess, refetch } =
    useGetServiceModels().useContinuous();

  if (isError) {
    <Wrapper aria-label="ServicesProvider-Failed" name={serviceName}>
      <ErrorView
        message={error.message}
        retry={refetch}
        ariaLabel="ServicesProvider-Failed"
      />
    </Wrapper>;
  }
  if (isSuccess) {
    return <Dependant services={data} mainServiceName={serviceName} />;
  }

  return (
    <Wrapper aria-label="ServicesProvider-Loading" name={serviceName}>
      <LoadingView ariaLabel="ServicesProvider-Loading" />
    </Wrapper>
  );
};
