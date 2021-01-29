import { fetchInmantaApi, IRequestParams } from "@app/utils/fetchInmantaApi";
import { KeycloakInstance } from "keycloak-js";
import { ServiceInstanceForAction } from "./ActionPresenter";

export class InstanceSetStatePresenter {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly keycloak: KeycloakInstance | undefined
  ) {}
  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getSetInstanceStateHandler(
    id: string
  ): ((instanceId: string, targetState: string) => Promise<void>) | null {
    const instance = this.getInstanceForId(id);
    if (instance) {
      return async (instanceId: string, targetState: string) =>
        this.setInstanceState(
          instanceId,
          instance?.service_entity,
          instance?.environment,
          targetState,
          instance?.version
        );
    }
    return null;
  }

  async setInstanceState(
    instanceId: string,
    serviceEntity: string,
    environment: string,
    targetState: string,
    version: number
  ): Promise<void> {
    const message = "Triggered from the console";
    const requestUrl = `/lsm/v1/service_inventory/${serviceEntity}/${instanceId}/state?current_version=${version}&target_state=${targetState}&message=${message}`;
    const requestParams: IRequestParams = {
      urlEndpoint: requestUrl,
      environmentId: environment,
      isEnvironmentIdRequired: true,
      setErrorMessage: () => {
        return;
      },
      keycloak: this.keycloak,
      method: "POST",
    };
    await fetchInmantaApi(requestParams);
  }
}
