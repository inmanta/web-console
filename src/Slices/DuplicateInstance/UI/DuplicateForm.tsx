import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
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

export const DuplicateForm: React.FC<Props> = ({ serviceEntity, instance }) => {
  const { commandResolver, environmentModifier, routeManager } =
    useContext(DependencyContext);
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
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const trigger = commandResolver.useGetTrigger<"CreateInstance">({
    kind: "CreateInstance",
    service_entity: serviceEntity.name,
  });

  const onSubmit = async (
    attributes: InstanceAttributeModel,
    setIsDirty: (values: boolean) => void,
  ) => {
    //as setState used in setIsDirty doesn't change immediately we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
    setIsDirty(false);

    const result = await trigger(fields, attributes);

    if (result.kind === "Left") {
      setIsDirty(true);
      setErrorMessage(result.value);
    } else {
      const newUrl = routeManager.getUrl("InstanceDetails", {
        service: serviceEntity.name,
        instance:
          result.value.data.service_identity_attribute_value ||
          result.value.data.id,
        instanceId: result.value.data.id,
      });

      navigate(`${newUrl}${location.search}`);
    }
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
      />
    </>
  );
};
