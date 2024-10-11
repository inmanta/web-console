import React, { useContext, useEffect, useState } from "react";
import { useGetAllServiceModels } from "@/Data/Managers/V2/GETTERS/GetAllServiceModels";
import { useGetRelatedInventories } from "@/Data/Managers/V2/GETTERS/GetRelatedInventories";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { findInterServiceRelations } from "../helpers";
import { CanvasProvider } from "./CanvasProvider";
import { InstanceComposerContext } from "./Context";

/**
 * Props interface for the ComposerCreatorProvider component
 *
 * This interface represents the properties that the ComposerCreatorProvider component expects to receive.
 *
 * @interface
 * @property {string} serviceName - The name of the service for which related services and inventories are being fetched.
 */
interface Props {
  serviceName: string;
}

/**
 * ComposerCreatorProvider component
 *
 * This component is responsible for providing the service model related data to the Canvas component through Context.
 * It fetches all service models and the related inventories.
 * It also handles the state and effects related to these data.
 * 
 * @param {Props} props - The properties that define the behavior and display of the component.
 * @param {string} props.serviceName - The name of the service for which related services and inventories are being fetched.

 * @returns {React.FC<Props>} The ComposerCreatorProvider component.
 */
export const ComposerCreatorProvider: React.FC<Props> = ({ serviceName }) => {
  const [relatedServiceNames, setRelatedServiceNames] = useState<string[]>([]);
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const serviceModels = useGetAllServiceModels(environment).useContinuous();

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

  if (serviceModels.isSuccess) {
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
          instance: null,
          relatedInventories: relatedInventories,
        }}
      >
        <CanvasProvider>
          <Canvas editable />
        </CanvasProvider>
      </InstanceComposerContext.Provider>
    );
  }

  return <LoadingView aria-label="ServicesWithMainProvider-loading" />;
};
