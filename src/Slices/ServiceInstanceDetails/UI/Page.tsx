import React, { useEffect, useState } from "react";
import { useUrlStateWithString } from "@/Data";
import { useGetServiceModel, useGetInstance, useGetInfiniteInstanceLogs } from "@/Data/Queries";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { InstanceDetailsContext } from "../Core/Context";
import { VersionedPageTitleWithActions } from "./Components/Sections";
import { ServiceInstanceDetailsLayout } from "./ServiceInstanceDetailsLayout";
interface Props {
  service: string;
  instance: string;
  instanceId: string;
  version: string;
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
  version,
}) => {
  const instanceDetails = useGetInstance(service, instanceId).useContinuous();

  const logsQuery = useGetInfiniteInstanceLogs(service, instanceId).useContinuous(version);

  const serviceModelQuery = useGetServiceModel(service).useOneTime();

  const pageTitle = `${service}: ${instance}`;

  if (instanceDetails.isError) {
    return (
      <PageContainer pageTitle={pageTitle}>
        <ErrorView
          ariaLabel="Instance-Details-Error"
          title={words("instanceDetails.page.errorFallback.title")}
          message={instanceDetails.error?.message || words("instanceDetails.page.errorFallback")}
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
    <InstanceDetailsContext.Provider
      value={{
        instance: instanceDetails.data,
        logsQuery,
        serviceModelQuery,
      }}
    >
      <PageContainer
        aria-label="Instance-Details-Success"
        pageTitle={<VersionedPageTitleWithActions title={pageTitle} />}
      >
        <ServiceInstanceDetailsLayout />
      </PageContainer>
    </InstanceDetailsContext.Provider>
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
  const [selectedVersion] = useUrlStateWithString<string>({
    default: "",
    key: "version",
    route: "InstanceDetails",
  });
  const [initialVersion, setInitialVersion] = useState("-1");

  useEffect(() => {
    if (initialVersion === "-1") {
      setInitialVersion(selectedVersion);
    }
  }, [selectedVersion, initialVersion]);

  //if the initial version is -1, return null,
  //  it is done to avoid passing empty string to the InfiniteQuery before the version is set from the url, otherwise we would get inadequate data at initial load, and only after the update the correct one.
  if (initialVersion === "-1") {
    return null;
  }

  return (
    <ServiceInstanceDetails
      service={service}
      instance={instance}
      instanceId={instanceId}
      version={initialVersion}
    />
  );
};
