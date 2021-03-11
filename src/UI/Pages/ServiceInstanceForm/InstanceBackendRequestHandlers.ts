import { ServiceModel } from "@/Core";
import {
  fetchInmantaApi,
  IRequestParams,
} from "@/UI/App/utils/fetchInmantaApi";
import { KeycloakInstance } from "keycloak-js";
import { FormAttributeResult } from ".";
import { ServiceInstanceForAction } from "@/UI/Pages/ServiceInventory/Presenters";
import { AttributeConverter } from "./AttributeConverter";

export async function submitUpdate(
  instance: ServiceInstanceForAction,
  attributeValue: FormAttributeResult[],
  setErrorMessage: (message: string) => void,
  dispatch: (data) => void,
  keycloak?: KeycloakInstance
): Promise<void> {
  const attributeConverter = new AttributeConverter();
  const inventoryUrl = `/lsm/v1/service_inventory/${instance.service_entity}`;
  const url = `${inventoryUrl}/${instance.id}?current_version=${instance.version}`;
  const requestParams: IRequestParams = {
    urlEndpoint: url,
    isEnvironmentIdRequired: true,
    environmentId: instance.environment,
    method: "PATCH",
    setErrorMessage: setErrorMessage,
    keycloak: keycloak,
    dispatch: dispatch,
  };
  // Make sure correct types are used
  const parsedAttributes = attributeConverter.parseAttributesToCorrectTypes(
    attributeValue
  );
  // Get the correct attribute set
  const currentAttributes = attributeConverter.getCurrentAttributes(instance);
  // Only the difference should be sent
  const updatedAttributes = attributeConverter.calculateDiff(
    parsedAttributes,
    currentAttributes
  );
  requestParams.data = { attributes: updatedAttributes };
  await fetchInmantaApi(requestParams);
}

export async function submitCreate(
  service: ServiceModel,
  attributes: FormAttributeResult[],
  setErrorMessage: (message: string) => void,
  dispatch: () => void,
  keycloak?: KeycloakInstance
): Promise<void> {
  const attributeConverter = new AttributeConverter();
  const url = `/lsm/v1/service_inventory/${service.name}`;
  const requestParams: IRequestParams = {
    urlEndpoint: url,
    isEnvironmentIdRequired: true,
    environmentId: service.environment,
    method: "POST",
    setErrorMessage: setErrorMessage,
    dispatch: dispatch,
    keycloak: keycloak,
  };
  const parsedAttributes = attributeConverter.parseAttributesToCorrectTypes(
    attributes
  );
  // Don't set optional attributes explicitly to null on creation
  const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
    (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
    {}
  );
  requestParams.data = { attributes: attributesWithoutNulls };
  await fetchInmantaApi(requestParams);
}
