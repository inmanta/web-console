import React, { useCallback, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
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

export const CreateInstance: React.FC<Props> = ({ serviceEntity }) => {
  const { commandResolver, environmentModifier, routeManager } =
    useContext(DependencyContext);
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
      <Description withSpace>
        {words("inventory.addInstance.title")(serviceEntity.name)}
      </Description>
      <ServiceInstanceForm
        service_entity={serviceEntity.name}
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        isSubmitDisabled={isHalted}
      />
    </>
  );
};
