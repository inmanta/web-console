import React from "react";
import { ServiceModel } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { useGetServices } from "./Queries/GetServices";

interface Props {
  serviceName: string;
  Wrapper: React.FC<{ name: string; children?: React.ReactNode }>;
  Dependant: React.FC<{ services: ServiceModel[]; mainServiceName: string }>;
}

export const ServicesProvider: React.FunctionComponent<Props> = ({
  serviceName,
  Dependant,
}) => {
  const { data, isLoading, error, isError, isPending, refetch } =
    useGetServices().useContinuous();

  if (isPending) return null;
  if (isLoading) return <LoadingView instant />;
  if (isError) return <ErrorView message={error.message} retry={refetch} />;
  return <Dependant services={data} mainServiceName={serviceName} />;
};
