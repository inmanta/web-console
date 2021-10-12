import {
  Field,
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
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import React, { useCallback, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

interface Props {
  serviceEntity: ServiceModel;
  instance: ServiceInstanceModel;
}

export const EditForm: React.FC<Props> = ({ serviceEntity, instance }) => {
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const fields = new FieldCreator(new EditModifierHandler()).create(
    serviceEntity
  );
  const isHalted = environmentModifier.useIsHalted();
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();
  const url = `${getUrl("Inventory", { service: serviceEntity.name })}?env=${
    serviceEntity.environment
  }`;

  const handleRedirect = useCallback(() => history.push(url), [history]);
  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const trigger = commandResolver.getTrigger<"TriggerInstanceUpdate">({
    kind: "TriggerInstanceUpdate",
    service_entity: instance.service_entity,
    id: instance.id,
    version: instance.version,
  });
  const onSubmit = async (
    fields: Field[],
    attributes: InstanceAttributeModel
  ) => {
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
        <AlertGroup isToast>
          <Alert
            variant={"danger"}
            title={errorMessage}
            actionClose={
              <AlertActionCloseButton onClose={() => setErrorMessage("")} />
            }
          />
        </AlertGroup>
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
