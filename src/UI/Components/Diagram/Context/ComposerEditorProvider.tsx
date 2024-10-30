import React, { useContext, useEffect, useMemo, useState } from "react";
import { useGetAllServiceModels } from "@/Data/Managers/V2/GETTERS/GetAllServiceModels";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { useGetInventoryList } from "@/Data/Managers/V2/GETTERS/GetInventoryList";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { findInterServiceRelations } from "../helpers";
import { CanvasProvider } from "./CanvasProvider";
import { InstanceComposerContext } from "./Context";
import { renderErrorView } from ".";

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
 * It fetches the service models for the entire catalog, and the inventories for the all Inter-service relations that can be connected to the created instance and most importantly instance user want to edit with all it's closest inter-service relations.
 * The difference from ComposerCreatorProvider is that this component also fetches the instance data, it's done to avoid unnecessary requests when displaying composer for creating new instances
 * It also handles the state and effects related to these data.
 *
 * @props {Props} props - The properties that define the behavior and display of the component.
 * @prop {string} serviceName - The name of the service for which the instance is being fetched.
 * @prop {string} instance - The ID of the instance to be fetched.
 * @prop {boolean} editable - A flag indicating if the instance is editable.
 *
 * @returns {React.FC<Props>} The ComposerEditorProvider component.
 */
export const ComposerEditorProvider: React.FC<Props> = ({
  serviceName,
  instance,
  editable,
}) => {
  const [interServiceRelationNames, setInterServiceRelationNames] = useState<
    string[]
  >([]);
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const serviceModelsQuery =
    useGetAllServiceModels(environment).useContinuous();

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
    environment,
    mainService,
    !editable, //if editable is true, we don't fetch referenced_by instances as they should be displayed to keep it aligned with the regular instance form
  ).useOneTime();

  const relatedInventoriesQuery = useGetInventoryList(
    interServiceRelationNames,
    environment,
  ).useContinuous();

  useEffect(() => {
    if (serviceModelsQuery.isSuccess) {
      if (mainService) {
        setInterServiceRelationNames(findInterServiceRelations(mainService));
      }
    }
  }, [
    serviceModelsQuery.isSuccess,
    serviceName,
    serviceModelsQuery.data,
    mainService,
  ]);

  if (serviceModelsQuery.isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(serviceModelsQuery.error.message)}
        aria-label="ComposerEditor-serviceModelsQuery_failed"
        retry={serviceModelsQuery.refetch}
      />
    );
  }
  if (instanceWithRelationsQuery.isError) {
    const message = words("error.general")(
      instanceWithRelationsQuery.error.message,
    );
    const retry = instanceWithRelationsQuery.refetch;
    const ariaLabel = "ComposerEditor-instanceWithRelationsQuery_failed";

    return renderErrorView(message, ariaLabel, retry);
  }

  if (relatedInventoriesQuery.isError) {
    const message = words("error.general")(
      relatedInventoriesQuery.error.message,
    );
    const retry = relatedInventoriesQuery.refetch;
    const ariaLabel = "ComposerEditor-relatedInventoriesQuery_failed";

    return renderErrorView(message, ariaLabel, retry);
  }

  if (serviceModelsQuery.isSuccess && instanceWithRelationsQuery.isSuccess) {
    if (!mainService) {
      const message = words("instanceComposer.noServiceModel.errorMessage")(
        serviceName,
      );
      const retry = serviceModelsQuery.refetch;
      const ariaLabel = "ComposerEditor-NoMainService_failed";

      return renderErrorView(message, ariaLabel, retry);
    }

    return (
      <InstanceComposerContext.Provider
        value={{
          mainService,
          serviceModels: serviceModelsQuery.data,
          instance: instanceWithRelationsQuery.data,
          relatedInventoriesQuery: relatedInventoriesQuery,
        }}
      >
        <CanvasProvider>
          <Canvas editable={editable} />
        </CanvasProvider>
      </InstanceComposerContext.Provider>
    );
  }

  return <LoadingView aria-label="ComposerEditor-loading" />;
};
