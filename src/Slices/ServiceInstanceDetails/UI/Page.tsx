import React, { useContext } from "react";
import { useGetInstance } from "@/Data/Managers/V2/GetInstance";
import { useGetInstanceLogs } from "@/Data/Managers/V2/GetInstanceLogs";
import { useGetServiceModel } from "@/Data/Managers/V2/GetServiceModel";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { InstanceContext } from "../Core/Context";
import { PageTitleWithVersion } from "./Components";
import { ServiceInstanceDetailsLayout } from "./ServiceInstanceDetailsLayout";

interface Props {
  service: string;
  instance: string;
  instanceId: string;
}

/**
 * The ServiceInstanceDetails Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} service - the name of the service_entity
 *  @prop {string} instance - the displayName of the instance
 *  @prop {string} instanceId - the uuid of the instance
 * @returns {React.FC<Props>}  A React Component that provides the context for the Service Instance Details.
 */
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
          title={words("instanceDetails.page.errorFallback.title")}
          message={
            instanceDetails.error?.message ||
            words("instanceDetails.page.errorFallback")
          }
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

  return instanceDetails.data ? (
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
  ) : (
    // fallback errorView in case we get an empty data set.
    <PageContainer pageTitle={pageTitle}>
      <ErrorView
        ariaLabel="Instance-Details-Error"
        title={words("instanceDetails.page.noData.errorTitle")}
        message={words("instanceDetails.page.noData")}
        retry={instanceDetails.refetch}
      />
    </PageContainer>
  );
};

/**
 * The Page Component
 *
 * @note For testing purposes, the useRouteParams logic has been separated.
 * The useRouteParam has its own coverage.
 *
 * @returns {React.FC} A React Component to wrap the ServiceInstanceDetails.
 */
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
