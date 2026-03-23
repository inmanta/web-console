import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { usePatchAttributes } from "@/Data/Queries";
import { FieldCreator, ServiceInstanceForm, EditModifierHandler } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

interface Props {
  serviceEntity: ServiceModel;
  instance: ServiceInstanceModel;
}

/**
 * EditForm component allows users to edit the attributes of a service instance.
 * It provides a form with fields based on the service entity and handles form submission.
 *
 * @props {Props} props - The properties for the EditForm component.
 * @prop {ServiceModel} props.serviceEntity - The service entity model containing the service details.
 * @prop {ServiceInstanceModel} props.instance - The service instance model containing the instance details.
 *
 * @returns {React.FC<Props>} A React functional component that renders the edit form.
 */
export const EditForm: React.FC<Props> = ({ serviceEntity, instance }) => {
  const { environmentHandler, routeManager } = useContext(DependencyContext);
  const [isDirty, setIsDirty] = useState(false);
  const { notifyError } = useAppAlert();
  const isDisabled = true;
  const fieldCreator = new FieldCreator(new EditModifierHandler(), isDisabled);
  const fields = fieldCreator.create(serviceEntity);
  const isHalted = environmentHandler.useIsHalted();
  const navigate = useNavigate();

  const url = routeManager.useUrl("InstanceDetails", {
    service: serviceEntity.name,
    instance: instance.service_identity_attribute_value || instance.id,
    instanceId: instance.id,
  });

  const handleRedirect = useCallback(() => navigate(url), [navigate, url]);

  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes = attributeInputConverter.getCurrentAttributes(instance);

  const apiVersion = serviceEntity.strict_modifier_enforcement ? "v2" : "v1";

  const { mutate } = usePatchAttributes(
    apiVersion,
    serviceEntity.name,
    instance.id,
    Number(instance.version),
    {
      onError: (error) => {
        setIsDirty(true);
        notifyError(words("inventory.editInstance.failed"), error.message);
      },
      onSuccess: () => {
        handleRedirect();
      },
    }
  );

  const onSubmit = async (
    updatedAttributes: InstanceAttributeModel,
    setIsDirty: (values: boolean) => void
  ) => {
    //as setState used in setIsDirty doesn't change immediately we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
    setIsDirty(false);
    mutate({ fields, currentAttributes, updatedAttributes });
  };

  return (
    <>
      <ServiceInstanceForm
        service_entity={serviceEntity.name}
        isEdit={true}
        fields={fields}
        onSubmit={onSubmit}
        onCancel={handleRedirect}
        isSubmitDisabled={isHalted}
        originalAttributes={currentAttributes ? currentAttributes : undefined}
        apiVersion={apiVersion}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
    </>
  );
};
