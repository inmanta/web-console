import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { usePostInstance } from "@/Data/Managers/V2/ServiceInstance";
import {
  CreateModifierHandler,
  ToastAlert,
  FieldCreator,
  ServiceInstanceForm,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceEntity: ServiceModel;
  instance: ServiceInstanceModel;
}

/**
 * DuplicateForm component is responsible for rendering a form to duplicate a service instance.
 * It handles form submission, validation, and redirection upon success or failure.
 *
 * @props {Props} props - The properties object.
 * @prop {ServiceModel} props.serviceEntity - The service entity model.
 * @prop {ServiceInstanceModel} props.instance - The service instance model.
 *
 * @returns {React.FC<Props>} - The DuplicateForm component.
 */
export const DuplicateForm: React.FC<Props> = ({ serviceEntity, instance }) => {
  const { environmentModifier, routeManager } = useContext(DependencyContext);
  const [isDirty, setIsDirty] = useState(false);
  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.create(serviceEntity);
  const [errorMessage, setErrorMessage] = useState("");
  const isHalted = environmentModifier.useIsHalted();
  const navigate = useNavigate();
  const url = routeManager.useUrl("InstanceDetails", {
    service: serviceEntity.name,
    instance: instance.service_identity_attribute_value || instance.id,
    instanceId: instance.id,
  });

  const handleRedirect = useCallback(() => navigate(url), [navigate, url]);

  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes = attributeInputConverter.getCurrentAttributes(instance);

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
    setIsDirty: (values: boolean) => void
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
      <ServiceInstanceForm
        service_entity={serviceEntity.name}
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        originalAttributes={currentAttributes ? currentAttributes : undefined}
        isSubmitDisabled={isHalted}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
    </>
  );
};
