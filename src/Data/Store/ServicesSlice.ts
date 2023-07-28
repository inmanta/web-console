import { Action, action } from "easy-peasy";
import { Query, RemoteData, ServiceModel } from "@/Core";
import { ServiceKeyMaker } from "@/Data/Managers/Service/KeyMaker";

const serviceKeyMaker = new ServiceKeyMaker();

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
      environment: string;
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
      environment: string;
      query: Query.SubQuery<"GetService">;
      data: RemoteData.Type<string, ServiceModel>;
    }
  >;
}

export const servicesSlice: ServicesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv, byNameAndEnv }, { environment, data }) => {
    listByEnv[environment] = data;
    if (!RemoteData.isSuccess(data)) return;
    const { value: services } = data;
    const toDelete = Object.keys(byNameAndEnv).filter((key) =>
      serviceKeyMaker.matches([environment, ""], key),
    );
    toDelete.forEach((key) => delete byNameAndEnv[key]);
    services.forEach((service) => {
      const key = serviceKeyMaker.make([environment, service.name]);
      byNameAndEnv[key] = RemoteData.success(service);
    });
  }),
  byNameAndEnv: {},
  setSingle: action((state, { environment, query, data }) => {
    state.byNameAndEnv[serviceKeyMaker.make([environment, query.name])] = data;
  }),
};
