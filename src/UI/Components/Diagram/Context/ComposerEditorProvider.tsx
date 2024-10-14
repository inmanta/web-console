import React, { useContext, useEffect, useMemo, useState } from "react";
import { useGetAllServiceModels } from "@/Data/Managers/V2/GETTERS/GetAllServiceModels";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { useGetRelatedInventories } from "@/Data/Managers/V2/GETTERS/GetRelatedInventories";
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
 * This component is responsible for providing the instance data to the Canvas component through Context.
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

  const serviceModels = useGetAllServiceModels(environment).useContinuous();

  const mainModel = useMemo(
    () => serviceModels.data?.find((service) => service.name === serviceName),
    [serviceModels.data, serviceName],
  );

  const instanceWithRelations = useGetInstanceWithRelations(
    instance,
    environment,
    mainModel,
  ).useContinuous();

  const relatedInventories = useGetRelatedInventories(
    relatedServiceNames,
    environment,
  ).useContinuous();

  useEffect(() => {
    if (serviceModels.isSuccess) {
      const mainService = serviceModels.data.find(
        (service) => service.name === serviceName,
      );

      if (mainService) {
        setRelatedServiceNames(findInterServiceRelations(mainService));
      }
    }
  }, [serviceModels.isSuccess, serviceName, serviceModels.data]);

  if (serviceModels.isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(serviceModels.error.message)}
        aria-label="ServicesWithMainProvider-failed"
        retry={serviceModels.refetch}
      />
    );
  }

  if (relatedInventories.isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(relatedInventories.error.message)}
        aria-label="ServicesWithMainProvider-failed"
        retry={relatedInventories.refetch}
      />
    );
  }

  if (serviceModels.isSuccess && instanceWithRelations.isSuccess) {
    const mainService = serviceModels.data.find(
      (service) => service.name === serviceName,
    );

    if (!mainService) {
      return (
        <ErrorView
          data-testid="ErrorView"
          title={words("error")}
          message={words("instanceComposer.noServiceModel.errorMessage")(
            serviceName,
          )}
          aria-label="ServicesWithMainProvider-NoMAinService"
          retry={serviceModels.refetch}
        />
      );
    }

    return (
      <InstanceComposerContext.Provider
        value={{
          mainService,
          serviceModels: serviceModels.data,
          instance: instanceWithRelations.data,
          relatedInventories: relatedInventories,
        }}
      >
        <CanvasProvider>
          <Canvas editable={editable} />
        </CanvasProvider>
      </InstanceComposerContext.Provider>
    );
  }

  return <LoadingView aria-label="ServicesWithMainProvider-loading" />;
};
