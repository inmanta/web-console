import { FormAttributeResult } from "@/Core";
import {
  fetchInmantaApi,
  IRequestParams,
} from "@/UI/App/utils/fetchInmantaApi";
import { KeycloakInstance } from "keycloak-js";
import { ServiceInstanceForAction } from "@/UI/Pages/ServiceInventory/Presenters";
import { AttributeResultConverter, getCurrentAttributes } from "@/UI/Data";

export async function submitUpdate(
  instance: ServiceInstanceForAction,
  attributeValue: FormAttributeResult[],
  setErrorMessage: (message: string) => void,
  dispatch: (data) => void,
  keycloak?: KeycloakInstance
): Promise<void> {
  const attributeConverter = new AttributeResultConverter();
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
  const parsedAttributes =
    attributeConverter.parseAttributesToCorrectTypes(attributeValue);
  // Get the correct attribute set
  const currentAttributes = getCurrentAttributes(instance);
  // Only the difference should be sent
  const updatedAttributes = attributeConverter.calculateDiff(
    parsedAttributes,
    currentAttributes
  );
  requestParams.data = { attributes: updatedAttributes };
  await fetchInmantaApi(requestParams);
}
