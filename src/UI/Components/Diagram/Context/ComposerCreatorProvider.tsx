import React, { useEffect, useState } from "react";
import { FlexItem, Flex } from "@patternfly/react-core";
import { useGetServiceModels } from "@/Data/Managers/V2/Service";
import { useGetInventoryList } from "@/Data/Managers/V2/ServiceInstance";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { ComposerActions } from "../components";
import { findInterServiceRelations } from "../helpers";
import { CanvasProvider } from "./CanvasProvider";
import { InstanceComposerContext } from "./Context";

/**
 * Props interface for the ComposerCreatorProvider component
 *
 * This interface represents the properties that the ComposerCreatorProvider component expects to receive.
 *
 * @interface
 * @property {string} serviceName - The name of the service for which inter-service related services and inventories are being fetched.
 */
interface Props {
  serviceName: string;
}

/**
 * ComposerCreatorProvider component
 *
 * This component is responsible for providing the service model related data to the Canvas component through Context.
 * It fetches the service models for the entire catalog, and the inventories for all the Inter-service relations that can be connected to the created instance.
 * It also handles the state and effects related to these data.
 * 
 * @props {Props} props - The properties that define the behavior and display of the component.
 * @prop {string} serviceName - The name of the service for which inter-service related services and inventories are being fetched.

 * @returns {React.FC<Props>} The ComposerCreatorProvider component.
 */
export const ComposerCreatorProvider: React.FC<Props> = ({ serviceName }) => {
  const [interServiceRelationNames, setInterServiceRelationNames] = useState<
    string[]
  >([]);

  const serviceModels = useGetServiceModels().useContinuous();

  const relatedInventoriesQuery = useGetInventoryList(
    interServiceRelationNames,
  ).useContinuous();

  useEffect(() => {
    if (serviceModels.isSuccess) {
      const mainService = serviceModels.data.find(
        (service) => service.name === serviceName,
      );

      if (mainService) {
        setInterServiceRelationNames(findInterServiceRelations(mainService));
      }
    }
  }, [serviceModels.isSuccess, serviceName, serviceModels.data]);

  if (serviceModels.isError) {
    const message = words("error.general")(serviceModels.error.message);
    const retry = serviceModels.refetch;
    const ariaLabel = "ComposerCreatorProvider-ServiceModelsQuery_failed";

    return renderErrorView(message, ariaLabel, retry);
  }

  if (relatedInventoriesQuery.isError) {
    const message = words("error.general")(
      relatedInventoriesQuery.error.message,
    );
    const retry = relatedInventoriesQuery.refetch;
    const ariaLabel = "ComposerCreatorProvider-RelatedInventoriesQuery_failed";

    return renderErrorView(message, ariaLabel, retry);
  }

  if (serviceModels.isSuccess) {
    const mainService = serviceModels.data.find(
      (service) => service.name === serviceName,
    );

    if (!mainService) {
      const message = words("instanceComposer.noServiceModel.errorMessage")(
        serviceName,
      );
      const retry = serviceModels.refetch;
      const ariaLabel = "ComposerCreatorProvider-NoServiceModel_failed";

      return renderErrorView(message, ariaLabel, retry);
    }

    return (
      <InstanceComposerContext.Provider
        value={{
          mainService,
          serviceModels: serviceModels.data,
          instance: null,
          relatedInventoriesQuery: relatedInventoriesQuery,
        }}
      >
        <CanvasProvider>
          <PageContainer
            pageTitle={
              <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
                <FlexItem> {words("instanceComposer.title")}</FlexItem>
                <FlexItem>
                  <ComposerActions serviceName={serviceName} editable />
                </FlexItem>
              </Flex>
            }
          >
            <Canvas editable />
          </PageContainer>
        </CanvasProvider>
      </InstanceComposerContext.Provider>
    );
  }

  return <LoadingView ariaLabel="ComposerCreatorProvider-Loading" />;
};

/**
 * Renders an error view component.
 *
 * @param {string} message - The error message to display.
 * @param {string} ariaLabel - The ARIA label for accessibility.
 * @param {Function} retry - The function to call when retrying the action.
 *
 * @returns {React.ReactElement} The rendered error view component.
 */
export const renderErrorView = (
  message: string,
  ariaLabel: string,
  retry: () => void,
): React.ReactElement => (
  <ErrorView
    data-testid="ErrorView"
    title={words("error")}
    message={message}
    ariaLabel={ariaLabel}
    retry={retry}
  />
);
