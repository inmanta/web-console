import React, { useContext } from "react";
import { useGetInstance } from "@/Data/Managers/V2/GetInstance";
import { useGetInstanceLogs } from "@/Data/Managers/V2/GetInstanceLogs";
import { useGetServiceModel } from "@/Data/Managers/V2/GetServiceModel";
import { DependencyContext, useRouteParams } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { InstanceContext } from "../Core/Context";
import { ServiceInstanceDetailsLayout } from "./ServiceInstanceDetailsLayout";

export const Page: React.FunctionComponent = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { service, instance } = useRouteParams<"InstanceDetails">();

  const instanceDetails = useGetInstance(
    service,
    instance,
    environment,
  ).useContinuous();

  const logsQuery = useGetInstanceLogs(
    service,
    instance,
    environment,
  ).useContinuous();

  const serviceModelQuery = useGetServiceModel(
    service,
    environment,
  ).useOneTime();

  const pageTitle = `${service}: ${instanceDetails.data?.service_identity_attribute_value || instance}`;

  return (
    <PageContainer pageTitle={pageTitle}>
      {instanceDetails.data && (
        <InstanceContext.Provider
          value={{
            instance: instanceDetails.data,
            logsQuery,
            serviceModelQuery,
          }}
        >
          <ServiceInstanceDetailsLayout />
        </InstanceContext.Provider>
      )}

      {instanceDetails.isLoading && (
        <LoadingView ariaLabel="Instance-Details-Loading" />
      )}

      {instanceDetails.isError && (
        <ErrorView
          ariaLabel="Instance-Details-Error"
          title="Error"
          message={instanceDetails.error.message}
          retry={instanceDetails.refetch}
        />
      )}
    </PageContainer>
  );
};
