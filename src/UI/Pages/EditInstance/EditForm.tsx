import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text, TextContent, TextVariants } from "@patternfly/react-core";
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
  ErrorToastAlert,
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
  const url = `${routeManager.getUrl("Inventory", {
    service: serviceEntity.name,
  })}?env=${serviceEntity.environment}`;

  const handleRedirect = useCallback(
    () => navigate(url),
    [navigate] /* eslint-disable-line react-hooks/exhaustive-deps */
  );
  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const trigger = commandResolver.getTrigger<"TriggerInstanceUpdate">({
    kind: "TriggerInstanceUpdate",
    service_entity: instance.service_entity,
    id: instance.id,
    version: instance.version,
  });
  const onSubmit = async (attributes: InstanceAttributeModel) => {
    const result = await trigger(fields, currentAttributes, attributes);
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    } else {
      handleRedirect();
    }
  };
  return (
    <>
      {errorMessage && (
        <ErrorToastAlert
          title={words("inventory.editInstance.failed")}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
      <TextContent>
        <Text component={TextVariants.small}>
          {words("inventory.editInstance.header")(instance.id)}
        </Text>
      </TextContent>
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
