import React, { useCallback, useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Text,
  TextContent,
  TextVariants,
} from "@patternfly/react-core";
import { useHistory } from "react-router-dom";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import { FieldCreator, ServiceInstanceForm } from "@/UI/Components";

export const CreateInstancePage: React.FC<{ serviceEntity: ServiceModel }> = ({
  serviceEntity,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();
  const url = `${getUrl("Inventory", { service: serviceEntity.name })}?env=${
    serviceEntity.environment
  }`;
  const handleRedirect = useCallback(() => history.push(url), [history]);

  const trigger = commandResolver.getTrigger<"CreateInstance">({
    kind: "CreateInstance",
    service_entity: serviceEntity.name,
  });

  const onSubmit = async (
    fields: Field[],
    attributes: InstanceAttributeModel
  ) => {
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
          {words("inventory.addInstance.title")(serviceEntity.name)}
        </Text>
      </TextContent>
      <ServiceInstanceForm
        fields={new FieldCreator().create(serviceEntity)}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
      />
    </>
  );
};
