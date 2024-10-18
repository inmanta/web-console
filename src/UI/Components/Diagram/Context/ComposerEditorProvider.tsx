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
  const [relatedServiceNames, setRelatedServiceNames] = useState<string[]>([]);
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const serviceModelsQuery =
    useGetAllServiceModels(environment).useContinuous();

  const mainService = useMemo(
    () =>
      serviceModelsQuery.data?.find((service) => service.name === serviceName),
    [serviceModelsQuery.data, serviceName],
  );

  const instanceWithRelationsQuery = useGetInstanceWithRelations(
    instance,
    environment,
    mainService,
  ).useOneTime();

  const relatedInventoriesQuery = useGetInventoryList(
    relatedServiceNames,
    environment,
  ).useContinuous();

  useEffect(() => {
    if (serviceModelsQuery.isSuccess) {
      if (mainService) {
        setRelatedServiceNames(findInterServiceRelations(mainService));
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
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(
          instanceWithRelationsQuery.error.message,
        )}
        aria-label="ComposerEditor-instanceWithRelationsQuery_failed"
        retry={instanceWithRelationsQuery.refetch}
      />
    );
  }

  if (relatedInventoriesQuery.isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(relatedInventoriesQuery.error.message)}
        aria-label="ComposerEditor-relatedInvetoriesQuery_failed"
        retry={relatedInventoriesQuery.refetch}
      />
    );
  }

  if (serviceModelsQuery.isSuccess && instanceWithRelationsQuery.isSuccess) {
    if (!mainService) {
      return (
        <ErrorView
          data-testid="ErrorView"
          title={words("error")}
          message={words("instanceComposer.noServiceModel.errorMessage")(
            serviceName,
          )}
          aria-label="ComposerEditor-NoMainService_failed"
          retry={serviceModelsQuery.refetch}
        />
      );
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
