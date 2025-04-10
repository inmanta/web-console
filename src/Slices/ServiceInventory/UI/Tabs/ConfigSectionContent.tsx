import React, { useContext } from "react";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { useGetInstanceConfig } from "@/Data/Managers/V2/ServiceInstance";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { ErrorView, LoadingView } from "@/UI/Components";
import { ConfigDetails } from "./ConfigDetails";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ConfigSectionContent: React.FC<Props> = ({ serviceInstanceIdentifier }) => {
  const { serviceModelQuery } = useContext(InstanceDetailsContext);

  const { service_entity, id } = serviceInstanceIdentifier;
  const { data, isSuccess, isError, error, refetch } = useGetInstanceConfig(
    service_entity,
    id
  ).useOneTime();

  if (isSuccess && serviceModelQuery.isSuccess) {
    const defaultsConfig = serviceModelQuery.data.config;

    return (
      <ConfigDetails
        config={data}
        defaults={defaultsConfig}
        serviceInstanceIdentifier={serviceInstanceIdentifier}
      />
    );
  }

  if (isError) {
    return <ErrorView retry={refetch} message={error.message} ariaLabel="ConfigDetails-Error" />;
  }

  if (serviceModelQuery.isError) {
    return (
      <ErrorView
        retry={refetch}
        message={serviceModelQuery.error.message}
        ariaLabel="ConfigDetails-Error"
      />
    );
  }

  return <LoadingView ariaLabel="ConfigDetails-Loading" />;
};
