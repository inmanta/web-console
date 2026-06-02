import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { usePatchAttributes, usePutAttributes } from "@/Data/Queries";
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
 * When `strict_modifier_enforcement` is true, the form submits via
 * PUT /api/v1/service_inventory with `ignore_read_only_attributes=true`.
 * Otherwise it submits via PATCH /lsm/v1/service_inventory (diff only).
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

  const isStrictEnforcement = serviceEntity.strict_modifier_enforcement ?? false;

  // "v2" form behavior: form state is initialised with all original attributes so that
  // read-only fields are visible (but disabled), matching the PUT full-attribute payload.
  const formApiVersion = isStrictEnforcement ? "v2" : "v1";

  const onMutationError = (error: Error) => {
    setIsDirty(true);
    notifyError({
      title: words("inventory.editInstance.failed"),
      message: error.message,
    });
  };

  const onMutationSuccess = () => handleRedirect();

  // Both hooks are always called (React rules of hooks). Only the relevant mutate is used.
  const { mutate: patchMutate } = usePatchAttributes(
    serviceEntity.name,
    instance.id,
    Number(instance.version),
    { onError: onMutationError, onSuccess: onMutationSuccess }
  );

  const { mutate: putMutate } = usePutAttributes(
    serviceEntity.name,
    instance.id,
    Number(instance.version),
    { onError: onMutationError, onSuccess: onMutationSuccess }
  );

  const onSubmit = async (
    updatedAttributes: InstanceAttributeModel,
    setIsDirty: (values: boolean) => void
  ) => {
    //as setState used in setIsDirty doesn't change immediately we cannot use it only before handleRedirect() as it would trigger prompt from ServiceInstanceForm
    setIsDirty(false);
    if (isStrictEnforcement) {
      putMutate({ fields, updatedAttributes });
    } else {
      patchMutate({ fields, currentAttributes, updatedAttributes });
    }
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
        apiVersion={formApiVersion}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
    </>
  );
};
