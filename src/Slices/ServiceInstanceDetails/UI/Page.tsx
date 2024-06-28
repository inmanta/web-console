import React, { useContext } from "react";
import { useGetInstance } from "@/Data/Managers/V2/GetInstance";
import { useGetInstanceLogs } from "@/Data/Managers/V2/GetInstanceLogs";
import { useGetServiceModel } from "@/Data/Managers/V2/GetServiceModel";
import { DependencyContext, useRouteParams } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { InstanceContext } from "../Core/Context";
import { PageTitleWithVersion } from "./Components";
import { ServiceInstanceDetailsLayout } from "./ServiceInstanceDetailsLayout";

interface Props {
  service: string;
  instance: string;
  instanceId: string;
}

export const ServiceInstanceDetails: React.FC<Props> = ({
  service,
  instance,
  instanceId,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const instanceDetails = useGetInstance(
    service,
    instanceId,
    environment,
  ).useContinuous();

  const logsQuery = useGetInstanceLogs(
    service,
    instanceId,
    environment,
  ).useContinuous();

  const serviceModelQuery = useGetServiceModel(
    service,
    environment,
  ).useOneTime();

  const pageTitle = `${service}: ${instance}`;

  if (instanceDetails.isError) {
    return (
      <PageContainer pageTitle={pageTitle}>
        <ErrorView
          ariaLabel="Instance-Details-Error"
          title="Error"
          message={instanceDetails.error?.message || "Something went wrong."}
          retry={instanceDetails.refetch}
        />
      </PageContainer>
    );
  }

  if (instanceDetails.isLoading) {
    return (
      <PageContainer pageTitle={pageTitle}>
        <LoadingView ariaLabel="Instance-Details-Loading" />
      </PageContainer>
    );
  }

  return (
    <InstanceContext.Provider
      value={{
        instance: instanceDetails.data,
        logsQuery,
        serviceModelQuery,
      }}
    >
      <PageContainer
        aria-label="Instance-Details-Success"
        pageTitle={<PageTitleWithVersion title={pageTitle} />}
      >
        <ServiceInstanceDetailsLayout />
      </PageContainer>
    </InstanceContext.Provider>
  );
};

export const Page: React.FC = () => {
  const { service, instance, instanceId } = useRouteParams<"InstanceDetails">();

  return (
    <ServiceInstanceDetails
      service={service}
      instance={instance}
      instanceId={instanceId}
    />
  );
};
