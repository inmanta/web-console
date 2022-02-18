import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text, TextContent, TextVariants } from "@patternfly/react-core";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  ErrorToastAlert,
  FieldCreator,
  ServiceInstanceForm,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceEntity: ServiceModel;
}

export const CreateInstance: React.FC<Props> = ({ serviceEntity }) => {
  const { commandResolver, environmentModifier, routeManager } =
    useContext(DependencyContext);
  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.create(serviceEntity);
  const [errorMessage, setErrorMessage] = useState("");
  const isHalted = environmentModifier.useIsHalted();
  const navigate = useNavigate();
  const url = `${routeManager.getUrl("Inventory", {
    service: serviceEntity.name,
  })}?env=${serviceEntity.environment}`;
  const handleRedirect = useCallback(
    () => navigate(url),
    [navigate] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  const trigger = commandResolver.getTrigger<"CreateInstance">({
    kind: "CreateInstance",
    service_entity: serviceEntity.name,
  });

  const onSubmit = async (attributes: InstanceAttributeModel) => {
    const result = await trigger(fields, attributes);
    if (result.kind === "Left") {
      setErrorMessage(result.value);
    } else {
      handleRedirect();
    }
  };

  return (
    <>
      {errorMessage && (
        <ErrorToastAlert
          title={words("inventory.addInstance.failed")}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
      <TextContent>
        <Text component={TextVariants.small}>
          {words("inventory.addInstance.title")(serviceEntity.name)}
        </Text>
      </TextContent>
      <ServiceInstanceForm
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        isSubmitDisabled={isHalted}
      />
    </>
  );
};
