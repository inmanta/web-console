import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  InstanceAttributeModel,
  Maybe,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import {
  FieldCreator,
  ServiceInstanceForm,
  EditModifierHandler,
  ToastAlert,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceEntity: ServiceModel;
  instance: ServiceInstanceModel;
}

export const EditForm: React.FC<Props> = ({ serviceEntity, instance }) => {
  const { commandResolver, environmentModifier, routeManager } =
    useContext(DependencyContext);
  const fieldCreator = new FieldCreator(new EditModifierHandler());
  const fields = fieldCreator.create(serviceEntity);
  const isHalted = environmentModifier.useIsHalted();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceEntity.name,
  });
  const handleRedirect = useCallback(
    () => navigate(url),
    [navigate] /* eslint-disable-line react-hooks/exhaustive-deps */
  );
  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const apiVersion = serviceEntity.strict_modifier_enforcement ? "v2" : "v1";

  const trigger = commandResolver.useGetTrigger<"TriggerInstanceUpdate">({
    kind: "TriggerInstanceUpdate",
    service_entity: instance.service_entity,
    id: instance.id,
    version: instance.version,
    apiVersion: apiVersion,
  });

  const onSubmit = async (
    attributes: InstanceAttributeModel,
    setIsDirty: (values: boolean) => void
  ) => {
    //as setState used in setIsDirty doesn't change immidiate we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
    setIsDirty(false);

    const result = await trigger(fields, currentAttributes, attributes);

    if (Maybe.isSome(result)) {
      setIsDirty(true);
      setErrorMessage(result.value);
    } else {
      handleRedirect();
    }
  };
  return (
    <>
      {errorMessage && (
        <ToastAlert
          title={words("inventory.editInstance.failed")}
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      )}
      <ServiceInstanceForm
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        isSubmitDisabled={isHalted}
        originalAttributes={currentAttributes ? currentAttributes : undefined}
      />
    </>
  );
};
