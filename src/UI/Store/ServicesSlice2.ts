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
export interface ServicesSlice2 {
  /**
   * Stores the full list of service names by their environment.
   */
  namesByEnv: Record<string, RemoteData.Type<string, string[]>>;
  /**
   * Sets a list of service names linked to an environment.
   * It also stores the services in the servicesByNameAndEnv record.
   */
  setList: Action<
    ServicesSlice2,
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
    ServicesSlice2,
    {
      qualifier: ServiceIdentifier;
      data: RemoteData.Type<string, ServiceModel>;
    }
  >;
}

export const servicesSlice2: ServicesSlice2 = {
  namesByEnv: {},
  setList: action((state, { qualifier, data }) => {
    const environment = qualifier.id;
    if (!RemoteData.isSuccess(data)) {
      state.namesByEnv[environment] = data;
    } else {
      const { value: services } = data;
      state.namesByEnv[environment] = RemoteData.success(
        services.map((service) => service.name)
      );
      services.forEach((service) => {
        const key = injections.serviceKeyMaker.make({
          environment,
          name: service.name,
        });
        state.byNameAndEnv[key] = RemoteData.success(service);
      });
    }
  }),
  byNameAndEnv: {},
  setSingle: action((state, payload) => {
    state.byNameAndEnv[injections.serviceKeyMaker.make(payload.qualifier)] =
      payload.data;
  }),
};
