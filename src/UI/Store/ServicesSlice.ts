import { Action, action } from "easy-peasy";
import {
  EnvironmentIdentifier,
  RemoteData,
  ServiceIdentifier,
  ServiceModel,
} from "@/Core";
import { injections } from "@/UI/Store/Injections";

/**
 * The ServicesSlice stores Services.
 */
export interface ServicesSlice {
  /**
   * Stores the full list of service names by their environment.
   */
  listByEnv: Record<string, RemoteData.Type<string, ServiceModel[]>>;
  /**
   * Sets a list of service names linked to an environment.
   * It also stores the services in the servicesByNameAndEnv record.
   */
  setList: Action<
    ServicesSlice,
    {
      qualifier: EnvironmentIdentifier;
      data: RemoteData.Type<string, ServiceModel[]>;
    }
  >;
  /**
   * Stores a single service by its name and environment.
   */
  byNameAndEnv: Record<string, RemoteData.Type<string, ServiceModel>>;
  /**
   * Sets a single service linked to an environment and service name.
   * This should not add services to the namesByEnv record
   * because we don't have the full list.
   */
  setSingle: Action<
    ServicesSlice,
    {
      qualifier: ServiceIdentifier;
      data: RemoteData.Type<string, ServiceModel>;
    }
  >;
}

export const servicesSlice: ServicesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv, byNameAndEnv }, { qualifier, data }) => {
    const { environment } = qualifier;
    listByEnv[environment] = data;
    if (!RemoteData.isSuccess(data)) return;
    const { value: services } = data;
    const toDelete = Object.keys(byNameAndEnv).filter((key) =>
      injections.serviceKeyMaker.matches({ environment, name: "" }, key)
    );
    toDelete.forEach((key) => delete byNameAndEnv[key]);
    services.forEach((service) => {
      const key = injections.serviceKeyMaker.make({
        environment,
        name: service.name,
      });
      byNameAndEnv[key] = RemoteData.success(service);
    });
  }),
  byNameAndEnv: {},
  setSingle: action((state, payload) => {
    state.byNameAndEnv[injections.serviceKeyMaker.make(payload.qualifier)] =
      payload.data;
  }),
};
