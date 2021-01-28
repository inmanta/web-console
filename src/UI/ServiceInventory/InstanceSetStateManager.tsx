import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { KeycloakInstance } from "keycloak-js";
import { ServiceInstanceForAction } from "./Presenters/ActionPresenter";

export class InstanceSetStateManager {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly keycloak: KeycloakInstance | undefined
  ) {}
  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getSetInstanceStateHandler(
    id: string
  ):
    | ((
        instanceId: string,
        targetState: string,
        setErrorMessage: (message: string) => void
      ) => Promise<void>)
    | null {
    const instance = this.getInstanceForId(id);
    if (instance) {
      return async (
        instanceId: string,
        targetState: string,
        setErrorMessage: (message: string) => void
      ) =>
        this.setInstanceState(
          instanceId,
          instance.service_entity,
          instance.environment,
          targetState,
          instance.version,
          setErrorMessage
        );
    }
    return null;
  }

  private async setInstanceState(
    instanceId: string,
    serviceEntity: string,
    environment: string,
    targetState: string,
    version: number,
    setErrorMessage: (message: string) => void
  ): Promise<void> {
    const userName =
      this.keycloak && this.keycloak.profile && this.keycloak.profile.username
        ? this.keycloak.profile.username
        : "";
    let message = "Triggered from the console";
    message += userName ? ` by ${userName}` : "";
    const requestUrl = `/lsm/v1/service_inventory/${serviceEntity}/${instanceId}/state?current_version=${version}&target_state=${targetState}&message=${message}`;
    const requestParams: IRequestParams = {
      urlEndpoint: requestUrl,
      environmentId: environment,
      isEnvironmentIdRequired: true,
      setErrorMessage,
      keycloak: this.keycloak,
      method: "POST",
    };
    await fetchInmantaApi(requestParams);
  }
}
