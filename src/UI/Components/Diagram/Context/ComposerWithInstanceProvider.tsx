import React, { useContext, useEffect, useState } from "react";
import { useGetAllServiceModels } from "@/Data/Managers/V2/GetAllServiceModels";
import { useGetInstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { useGetRelatedInventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Canvas } from "@/UI/Components/Diagram/Canvas";
import { findInterServiceRelations } from "../helpers";
import { CanvasProvider } from "./CanvasProvider";
import { InstanceComposerContext } from "./Context";

/**
 * Props interface for the ComposerWithInstanceProvider component
 *
 * This interface represents the properties that the ComposerWithInstanceProvider component expects to receive.
 *
 * @interface
 * @property {string} serviceName - The name of the service to be fetched.
 * @property {string} instance - The ID of the instance to be fetched.
 * @property {boolean} editable - A flag indicating if the canvas should editable.
 */
interface Props {
  serviceName: string;
  instance: string;
  editable: boolean;
}

/**
 * ComposerWithInstanceProvider component
 *
 * This component is responsible for providing the instance data to the Canvas component through Context.
 * It fetches all service models, the instance with its relations, and the related inventories.
 * It also handles the state and effects related to these data.
 *
 * @param {Props} props - The properties that define the behavior and display of the component.
 * @param {string} props.serviceName - The name of the service for which the instance is being fetched.
 * @param {string} props.instance - The ID of the instance to be fetched.
 * @param {boolean} props.editable - A flag indicating if the instance is editable.
 *
 * @returns {React.FC<Props>} The ComposerWithInstanceProvider component.
 */
export const ComposerWithInstanceProvider: React.FC<Props> = ({
  serviceName,
  instance,
  editable,
}) => {
  const [relatedServiceNames, setRelatedServiceNames] = useState<string[]>([]);
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const serviceModels = useGetAllServiceModels(environment).useContinuous();

  const instanceWithRelations = useGetInstanceWithRelations(
    instance,
    environment,
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
          message={words("provider.noMainService")(serviceName)}
          aria-label="ServicesWithMainProvider-NoMAinService"
          retry={serviceModels.refetch}
        />
      );
    }

    return (
      <InstanceComposerContext.Provider
        value={{
          mainService,
          serviceModels: serviceModels.data.filter((service) =>
            relatedServiceNames?.includes(service.name),
          ),
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
