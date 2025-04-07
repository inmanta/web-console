import React, { useEffect, useState } from "react";
import { useUrlStateWithString } from "@/Data";
import { useGetServiceModel } from "@/Data/Managers/V2/Service";
import { useGetInstance } from "@/Data/Managers/V2/ServiceInstance";
import { useRouteParams } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";

interface Props {
    service: string;
    instance: string;
    instanceId: string;
}

/**
 * The MarkdownPreviewer Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} service - the name of the service_entity
 *  @prop {string} instance - the displayName of the instance
 *  @prop {string} instanceId - the uuid of the instance
 * @returns {React.FC<Props>}  A React Component that provides the context for the Markdown Previewer.
 */
export const MarkdownPreviewer: React.FC<Props> = ({
    service,
    instance,
    instanceId,
}) => {
    const instanceDetails = useGetInstance(service, instanceId).useContinuous();
    const serviceModelQuery = useGetServiceModel(service).useOneTime();

    const pageTitle = `${service}: ${instance}`;

    if (instanceDetails.isError) {
        return (
            <PageContainer pageTitle={pageTitle}>
                <ErrorView
                    ariaLabel="Markdown-Previewer-Error"
                    title="Error loading instance details"
                    message={instanceDetails.error?.message || "Failed to load instance details"}
                    retry={instanceDetails.refetch}
                />
            </PageContainer>
        );
    }

    if (instanceDetails.isLoading) {
        return (
            <PageContainer pageTitle={pageTitle}>
                <LoadingView ariaLabel="Markdown-Previewer-Loading" />
            </PageContainer>
        );
    }

    return instanceDetails.data ? (
        <PageContainer
            aria-label="Markdown-Previewer-Success"
            pageTitle={pageTitle}
        >
            {/* TODO: Add MarkdownPreviewer layout component here */}
        </PageContainer>
    ) : (
        <PageContainer pageTitle={pageTitle}>
            <ErrorView
                ariaLabel="Markdown-Previewer-Error"
                title="No data available"
                message="No instance data was found"
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
 * @returns {React.FC} A React Component to wrap the MarkdownPreviewer.
 */
export const Page: React.FC = () => {
    const { service, instance, instanceId } = useRouteParams<"MarkdownPreviewer">();

    return (
        <MarkdownPreviewer
            service={service}
            instance={instance}
            instanceId={instanceId}
        />
    );
};

