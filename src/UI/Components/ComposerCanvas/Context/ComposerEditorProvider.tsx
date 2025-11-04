import React, { useEffect, useMemo, useState } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import {
  useGetServiceModels,
  useGetInstanceWithRelations,
  useGetInventoryList,
} from "@/Data/Queries";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { Canvas } from "@/UI/Components/ComposerCanvas/Components";
import { ComposerActions } from "../Components";
import { findInterServiceRelations } from "../Helpers";
import { CanvasProvider } from "./CanvasProvider";
import { InstanceComposerContext } from "./Context";
import { Composer } from "../../Composer/Composer";

/**
 * Props interface for the ComposerEditorProvider component
 *
 * This interface represents the properties that the ComposerEditorProvider component expects to receive.
 *
 * @interface
 * @prop {string} serviceName - The name of the service to be fetched.
 * @prop {string} instance - The ID of the instance to be fetched.
 * @prop {boolean} editable - A flag indicating if the canvas should editable.
 */
interface Props {
  serviceName: string;
  instance: string;
  editable: boolean;
}

/**
 * ComposerEditorProvider component
 *
 * This component is responsible for providing the service model related data to the Canvas component through Context.
 * It fetches the service models for the entire catalog, and the inventories for all Inter-service relations that can be connected to the created instance and most importantly instance user want to edit with all its closest inter-service relations.
 * The difference from ComposerCreatorProvider is that this component also fetches the instance data, it's done to avoid unnecessary requests when displaying composer for creating new instances
 * It also handles the state and effects related to this data.
 *
 * @props {Props} props - The properties that define the behavior and display of the component.
 * @prop {string} serviceName - The name of the service for which the instance is being fetched.
 * @prop {string} instance - The ID of the instance to be fetched.
 * @prop {boolean} editable - A flag indicating if the instance is editable.
 *
 * @returns {React.FC<Props>} The ComposerEditorProvider component.
 */
export const ComposerEditorProvider: React.FC<Props> = ({ serviceName, instance, editable }) => {
  const [interServiceRelationNames, setInterServiceRelationNames] = useState<string[]>([]);

  const serviceModelsQuery = useGetServiceModels().useContinuous();

  const mainService = useMemo(() => {
    const data = serviceModelsQuery.data;

    if (data) {
      return data.find((service) => service.name === serviceName);
    } else {
      return undefined;
    }
  }, [serviceModelsQuery.data, serviceName]);

  const instanceWithRelationsQuery = useGetInstanceWithRelations(
    instance,
    !editable, //if editable is true, we don't fetch referenced_by instances as they should not be displayed to keep it aligned with the regular instance form, they are only displayed in the composer viewer
    mainService
  ).useOneTime();

  const relatedInventoriesQuery = useGetInventoryList(interServiceRelationNames).useContinuous();

  useEffect(() => {
    if (serviceModelsQuery.isSuccess) {
      if (mainService) {
        setInterServiceRelationNames(findInterServiceRelations(mainService));
      }
    }
  }, [serviceModelsQuery.isSuccess, serviceName, serviceModelsQuery.data, mainService]);

  if (serviceModelsQuery.isError) {
    const message = words("error.general")(serviceModelsQuery.error.message);
    const retry = serviceModelsQuery.refetch;
    const ariaLabel = "ComposerEditorProvider-ServiceModelsQuery_failed";

    return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
  }

  if (instanceWithRelationsQuery.isError) {
    const message = words("error.general")(instanceWithRelationsQuery.error.message);
    const retry = instanceWithRelationsQuery.refetch;
    const ariaLabel = "ComposerEditorProvider-InstanceWithRelationsQuery_failed";

    return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
  }

  if (relatedInventoriesQuery.isError) {
    const message = words("error.general")(relatedInventoriesQuery.error.message);
    const retry = relatedInventoriesQuery.refetch;
    const ariaLabel = "ComposerEditorProvider-RelatedInventoriesQuery_failed";

    return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
  }

  if (serviceModelsQuery.isSuccess && !mainService) {
    const message = words("instanceComposer.noServiceModel.errorMessage")(serviceName);
    const retry = serviceModelsQuery.refetch;
    const ariaLabel = "ComposerEditorProvider-NoServiceModel_failed";

    return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
  }

  if (serviceModelsQuery.isSuccess && instanceWithRelationsQuery.isSuccess && mainService) {
    // there is no possibility to instanceWithRelationsQuery be in success state without mainService, and there is assertion above the if services are fetch but there is no mainService to display errorView
    return (
      <InstanceComposerContext.Provider
        value={{
          mainService: mainService,
          serviceModels: serviceModelsQuery.data,
          instance: instanceWithRelationsQuery.data,
          relatedInventoriesQuery: relatedInventoriesQuery,
        }}
      >
        <CanvasProvider>
          <PageContainer
            pageTitle={
              <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
                <FlexItem>
                  {words(editable ? "instanceComposer.title.edit" : "instanceComposer.title.view")}
                </FlexItem>
                <FlexItem>
                  <ComposerActions serviceName={serviceName} editable={editable} />
                </FlexItem>
              </Flex>
            }
          >
            {/* <Canvas editable={editable} /> */}
            <Composer editable={editable} instanceId={instance} serviceName={serviceName} />
          </PageContainer>
        </CanvasProvider>
      </InstanceComposerContext.Provider>
    );
  }

  return <LoadingView ariaLabel="ComposerEditorProvider-Loading" />;
};
