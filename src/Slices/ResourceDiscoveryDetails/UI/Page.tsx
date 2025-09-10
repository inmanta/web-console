import { useRouteParams } from "@/UI/Routing";
import React from "react";
import { useGetDiscoveredResourceDetails } from "@/Data/Queries/Slices/DiscoveredResources/useGetDiscoveredResourceDetails";
import { Description, EmptyView, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";
import { ButtonVariant, Flex, FlexItem } from "@patternfly/react-core";
import { AttributesCard } from "./AttributesCard";
import { DiscoveredResourceLink } from "@/Slices/ResourceDiscovery/UI/Components";

export const Page: React.FC = () => {
    const { resourceId } = useRouteParams<"DiscoveredResourceDetails">();
    const { data, isSuccess, isError, error, refetch } = useGetDiscoveredResourceDetails().useContinuous(resourceId);

    if (isError) {
        return (
            <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
                <ErrorView message={error.message} ariaLabel="OrderDetailsView-Error" retry={refetch} />
            </PageContainer>
        );
    }

    if (isSuccess && !data) {
        return (
            <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
                <EmptyView message={words("discoveredResourceDetails.empty")} aria-label="DiscoveredResourceDetailsView-Empty" />
            </PageContainer>
        );
    }

    if (isSuccess) {
        return (
            <PageContainer
                pageTitle={words("discoveredResourceDetails.title")}
            >
                <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
                    <FlexItem>
                        <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
                            <FlexItem>
                                <Description>{data.discovered_resource_id}</Description>
                            </FlexItem>
                            <FlexItem>
                                {data.managed_resource_uri && (
                                    <DiscoveredResourceLink resourceUri={data.managed_resource_uri} resourceType="managed" buttonType={ButtonVariant.primary} />
                                )}
                                {data.discovery_resource_uri && (
                                    <DiscoveredResourceLink resourceUri={data.discovery_resource_uri} resourceType="discovery" buttonType={ButtonVariant.primary} />
                                )}
                            </FlexItem>
                        </Flex>
                    </FlexItem>
                    <FlexItem>
                        <AttributesCard resource={data} />
                    </FlexItem>
                </Flex>
            </PageContainer>
        )
    }

    return (
        <PageContainer pageTitle={words("discoveredResourceDetails.title")}>
            <LoadingView ariaLabel="DiscoveredResourceDetails-Loading" />;
        </PageContainer>
    );
};

