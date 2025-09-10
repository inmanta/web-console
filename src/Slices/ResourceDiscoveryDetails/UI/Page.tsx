import React from "react";
import { ButtonVariant, Flex, FlexItem } from "@patternfly/react-core";
import { useGetDiscoveredResourceDetails } from "@/Data/Queries/Slices/DiscoveredResources/useGetDiscoveredResourceDetails";
import { DiscoveredResourceLink } from "@/Slices/ResourceDiscovery/UI/Components";
import { Description, EmptyView, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { AttributesCard } from "./AttributesCard";

// The wrapper is purely meant to extract the logic from the routing,
// which cannot be tested reliably in test-environments.
export const PageWrapper: React.FC = () => {
  const { resourceId } = useRouteParams<"DiscoveredResourceDetails">();
  return <Page resourceId={resourceId} />;
};

/**
 * The Page component.
 *
 * This component is responsible of displaying the discovered resource details.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} resourceId - The id of the discovered resource
 *
 * @returns {React.FC} A React Component displaying the discovered resource details
 */
export const Page: React.FC<{ resourceId: string }> = ({ resourceId }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetDiscoveredResourceDetails().useContinuous(resourceId);

  if (isError) {
    return (
      <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
        <ErrorView
          message={error.message}
          ariaLabel="DiscoveredResourceDetailsView-Error"
          retry={refetch}
        />
      </PageContainer>
    );
  }

  if (isSuccess && !data) {
    return (
      <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
        <EmptyView
          message={words("discoveredResourceDetails.empty")}
          aria-label="DiscoveredResourceDetailsView-Empty"
        />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
        <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
          <FlexItem>
            <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
              <FlexItem>
                <Description>{data.discovered_resource_id}</Description>
              </FlexItem>
              <FlexItem>
                {data.managed_resource_uri && (
                  <DiscoveredResourceLink
                    resourceUri={data.managed_resource_uri}
                    resourceType="managed"
                    buttonType={ButtonVariant.primary}
                  />
                )}
                {data.discovery_resource_uri && (
                  <DiscoveredResourceLink
                    resourceUri={data.discovery_resource_uri}
                    resourceType="discovery"
                    buttonType={ButtonVariant.primary}
                  />
                )}
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <AttributesCard resource={data} />
          </FlexItem>
        </Flex>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
      <LoadingView ariaLabel="DiscoveredResourceDetails-Loading" />;
    </PageContainer>
  );
};
