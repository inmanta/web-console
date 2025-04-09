import { useEffect, useState } from "react";
import { useGetServiceModel } from "@/Data/Managers/V2/Service";
import { useGetInstance } from "@/Data/Managers/V2/ServiceInstance";
import { words } from "@/UI/words";

/**
 * Props interface for the useDocumentationContent hook
 * @interface Props
 * @property {string} service - The service identifier
 * @property {string} instanceId - The instance identifier
 */
interface Props {
    service: string;
    instanceId: string;
}

/**
 * Result interface for the useDocumentationContent hook
 * @interface Result
 * @property {string} code - The combined markdown content from all documentation attributes
 * @property {string} pageTitle - The title of the documentation page
 */
interface Result {
    code: string;
    pageTitle: string;
}

/**
 * Custom hook that fetches and combines documentation content from multiple attributes
 *
 * This hook:
 * 1. Fetches instance details and service model data
 * 2. Identifies all attributes marked as documentation
 * 3. Combines their content into a single markdown document
 * 4. Returns the combined content and page title
 *
 * @param {Props} props - The props containing service and instance information
 * @returns {Result} An object containing the combined markdown content and page title
 */
export const useDocumentationContent = ({
    service,
    instanceId,
}: Props): Result => {
    const instanceDetails = useGetInstance(service, instanceId).useOneTime();
    const serviceModelQuery = useGetServiceModel(service).useOneTime();
    const [code, setCode] = useState<string>("");

    const pageTitle = words("markdownPreviewer.pageTitle")(
        service,
        instanceDetails.data?.service_identity_attribute_value || instanceId,
    );

    useEffect(() => {
        if (instanceDetails.data) {
            // Filter attributes to find those marked as documentation
            const docAttributes =
                serviceModelQuery.data?.attributes?.filter(
                    (attr) =>
                        attr.attribute_annotations?.web_presentation === "documentation",
                ) || [];

            if (docAttributes.length > 0) {
                // Combine all documentation attributes into a single markdown document
                const documentationContent = docAttributes
                    .map((attr) => {
                        // Get the attribute value from candidate, active, or rollback attributes
                        const value =
                            instanceDetails.data.candidate_attributes?.[attr.name] ||
                            instanceDetails.data.active_attributes?.[attr.name] ||
                            instanceDetails.data.rollback_attributes?.[attr.name] ||
                            "";

                        // Format each attribute as a markdown section with its title
                        return `# ${attr.attribute_annotations?.web_title || attr.name}\n\n${value}\n\n`;
                    })
                    .join("\n\n");

                setCode(documentationContent);
            }
        }
    }, [instanceDetails.data, serviceModelQuery.data]);

    // Return empty content if there's an error or while loading
    if (instanceDetails.isError || instanceDetails.isLoading) {
        return { code: "", pageTitle };
    }

    return { code, pageTitle };
};
