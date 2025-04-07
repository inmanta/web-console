import React, { useCallback, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { usePostInstance } from "@/Data/Managers/V2/ServiceInstance";
import {
  CreateModifierHandler,
  Description,
  ToastAlert,
  FieldCreator,
  ServiceInstanceForm,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceEntity: ServiceModel;
}

/**
 * `CreateInstance` is a React functional component responsible for rendering a form
 * to create a new instance of a given service entity. It handles form submission,
 * error handling, and redirection upon successful creation.
 *
 * @component
 * @props {Props} props - The props for the component.
 * @prop {ServiceModel} props.serviceEntity - The service entity for which an instance is being created.
 *
 * @returns {React.FC<Props>} A React functional component.
 */
export const CreateInstance: React.FC<Props> = ({ serviceEntity }) => {
  const { environmentModifier, routeManager } = useContext(DependencyContext);
  const [isDirty, setIsDirty] = useState(false);
  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.create(serviceEntity);
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const isHalted = environmentModifier.useIsHalted();
  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceEntity.name,
  });

  const handleRedirect = useCallback(() => navigate(url), [navigate, url]);

  const { mutate } = usePostInstance(serviceEntity.name, {
    onError: (error) => {
      setIsDirty(true);
      setErrorMessage(error.message);
    },
    onSuccess: ({ data }) => {
      const newUrl = routeManager.getUrl("InstanceDetails", {
        service: serviceEntity.name,
        instance: data.service_identity_attribute_value || data.id,
        instanceId: data.id,
      });

      navigate(`${newUrl}${location.search}`);
    },
  });

  const onSubmit = async(
    attributes: InstanceAttributeModel,
    setIsDirty: (values: boolean) => void,
  ) => {
    //as setState used in setIsDirty doesn't change immediately we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
    setIsDirty(false);
    mutate({ fields, attributes });
  };

  return (
    <>
      {errorMessage && (
        <ToastAlert
          data-testid="ToastAlert"
          title={words("inventory.addInstance.failed")}
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      )}
      <Description withSpace>
        {words("inventory.addInstance.title")(serviceEntity.name)}
      </Description>
      <ServiceInstanceForm
        service_entity={serviceEntity.name}
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        isSubmitDisabled={isHalted}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
    </>
  );
};
